"use server";

import {RefillingTokenBucket} from "@/lib/actions/rate-limits";
import {
    createSession,
    generateSessionToken,
    getCurrentSession,
    getSessionCookie,
    SessionValidationResult,
    setSessionTokenCookie
} from "@/lib/actions/session";
import {headers, cookies} from "next/headers";
import {globalPOSTRateLimit} from "@/lib/actions/requests";
import {createUser, getUserFromEmail, updateUserEmailAndSetEmailAsVerified, User} from "@/lib/actions/user";
import {z} from "zod";
import {EmailSchema, OTPSchema} from "@/lib/schemas";
import {
    createEmailVerificationRequest,
    deleteUserEmailVerificationRequest,
    EmailVerificationRequest,
    getUserEmailVerificationRequest,
    sendVerificationEmail,
    sendVerificationEmailBucket
} from "@/lib/actions/auth/email-verification";
import {revalidateTag} from "next/cache";
import {acceptTOS} from "@/lib/term-of-service";
import {TOS_VERSION} from "@/lib/local-variables";
import {getTranslations} from "next-intl/server";
import { logger } from "@/lib/logger";
import {getRequestContext} from "@/lib/request-context";
import { replaceGuestAddress } from "@/lib/actions/delivery-actions";
import { replaceGuestCart } from "@/lib/actions/cart";

// Initialize logger for auth module
const log = logger.child({ module: "auth" });

/**
 * Type definition for the standard action result
 * Either contains an error message or null for success
 */
export type ActionResult = { message: string } | null;

/**
 * Type definition for the login action result
 * Contains optional session validation result and message
 */
export type ActionLogin = { session?: SessionValidationResult, message?: string};

/**
 * Token bucket for rate limiting by IP address
 * Allows 20 tokens with 1 token refilled per second
 */
const ipBucket = new RefillingTokenBucket<string>(20, 1);

/**
 * Handles user login by email
 */
export async function loginAction(_prev: ActionResult, formData: z.infer<typeof EmailSchema>, notSendVerification: boolean = false): Promise<ActionResult> {
    const t = await getTranslations("app/(auth)/auth/actions");
    const context = await getRequestContext();
    const clientIP = context.clientIP || undefined;

    log.info('loginAction', 'Login attempt started', { 
        requestId: context.requestId,
        clientIP
    });

    // Check global rate limit
    if (!await globalPOSTRateLimit()) {
        log.warn('loginAction', 'Global rate limit hit', { 
            requestId: context.requestId,
            clientIP 
        });
        return { message: t("tooManyRequests") };
    }

    // Check IP-based rate limit
    if (clientIP && !ipBucket.check(clientIP, 1)) {
        log.warn('loginAction', 'IP rate limit hit', { 
            requestId: context.requestId,
            clientIP 
        });
        return { message: t("tooManyRequests") };
    }

    // Validate email
    const validation = EmailSchema.safeParse(formData);
    if (!validation.success) {
        log.warn('loginAction', 'Invalid email format', { 
            requestId: context.requestId,
            clientIP,
            data: { validationErrors: validation.error.errors }
        });
        return { message: t("invalidOrMissingField") };
    }

    // Consume rate limit token
    if (clientIP && !ipBucket.consume(clientIP, 1)) {
        log.warn('loginAction', 'IP rate limit consumed', { 
            requestId: context.requestId,
            clientIP 
        });
        return { message: t("tooManyRequests") };
    }

    const email = formData.email.toLowerCase();
    log.info('loginAction', 'Processing login for email', { 
        requestId: context.requestId,
        clientIP,
        email 
    });

    // Get or create user
    let user: User | null = await getUserFromEmail(email);
    if (user === null) {
        log.info('loginAction', 'Creating new user', { 
            requestId: context.requestId,
            clientIP,
            email 
        });
        user = await createUser(email);
    } else {
        log.info('loginAction', 'Existing user found', { 
            requestId: context.requestId,
            clientIP,
            email,
            userId: user.id 
        });
    }

    // Create and send verification email
    try {
        const emailVerificationRequest = await createEmailVerificationRequest(user.id, user.email);
        if (!notSendVerification) {
            await sendVerificationEmail(emailVerificationRequest.email, emailVerificationRequest.code);
        }
        await setEmailVerificationRequestCookie(emailVerificationRequest);
        
        log.info('loginAction', 'Verification email sent successfully', { 
            requestId: context.requestId,
            clientIP,
            email,
            userId: user.id 
        });
    } catch (error) {
        log.error('loginAction', 'Failed to send verification email', { 
            requestId: context.requestId,
            clientIP,
            email,
            userId: user.id,
            error 
        });
        return { message: t("problemSendingEmail") };
    }

    return null;
}

/**
 * Verifies the email using the OTP code provided
 */
export async function verifyEmailAction(_prev: ActionLogin, formData: z.infer<typeof OTPSchema>, storeId?: string): Promise<ActionLogin> {
    const t = await getTranslations("app/(auth)/auth/actions");
    const context = await getRequestContext();
    const clientIP = context.clientIP || undefined;


    const sessionGuest = await getSessionCookie();
    if (sessionGuest) {
        log.info('verifyEmailAction', 'Session found', { 
            requestId: context.requestId,
            clientIP
        })
    }

    log.info('verifyEmailAction', 'Email verification attempt started', { 
        requestId: context.requestId,
        clientIP
    });

    // Check global rate limit
    if (!await globalPOSTRateLimit()) {
        log.warn('verifyEmailAction', 'Global rate limit hit', { 
            requestId: context.requestId,
            clientIP 
        });
        return { message: t("tooManyRequests") };
    }

    // Validate OTP input
    const validation = OTPSchema.safeParse(formData);
    if (!validation.success) {
        log.warn('verifyEmailAction', 'Invalid OTP format', { 
            requestId: context.requestId,
            clientIP,
            data: { validationErrors: validation.error.errors } 
        });
        return { message: t("invalidOrMissingField") };
    }

    const email = formData.email.toLowerCase();
    const user = await getUserFromEmail(email);
    if (user === null) {
        log.warn('verifyEmailAction', 'Account does not exist', { 
            requestId: context.requestId,
            clientIP,
            email 
        });
        return { message: t("accountDoesNotExist") };
    }

    const code = formData.otp;
    log.debug('verifyEmailAction', 'Processing verification', { 
        requestId: context.requestId,
        clientIP,
        email,
        userId: user.id
    });

    // Check IP-based rate limit
    if (clientIP && !ipBucket.check(clientIP, 1)) {
        log.warn('verifyEmailAction', 'IP rate limit hit', { 
            requestId: context.requestId,
            clientIP,
            email,
            userId: user.id
        });
        return { message: t("tooManyRequests") };
    }

    // Get verification request
    let verificationRequest = await getUserEmailVerificationRequestFromRequest(user.id);
    if (verificationRequest === null) {
        log.warn('verifyEmailAction', 'No verification request found', { 
            requestId: context.requestId,
            clientIP,
            email,
            userId: user.id
        });
        return { message: t("notAuthenticated") };
    }

    // Consume rate limit token
    if (clientIP && !ipBucket.consume(clientIP, 1)) {
        log.warn('verifyEmailAction', 'IP rate limit consumed', { 
            requestId: context.requestId,
            clientIP,
            email,
            userId: user.id
        });
        return { message: t("tooManyRequests") };
    }

    // Handle expired verification code
    if (Date.now() >= verificationRequest.expiresAt.getTime()) {
        log.info('verifyEmailAction', 'Verification code expired, sending new one', { 
            requestId: context.requestId,
            clientIP,
            email,
            userId: user.id 
        });
        
        verificationRequest = await createEmailVerificationRequest(verificationRequest.userId, verificationRequest.email);
        await sendVerificationEmail(verificationRequest.email, verificationRequest.code);
        return { message: t("verificationCodeExpired") };
    }

    // Check code validity
    if (verificationRequest.code !== code) {
        log.warn('verifyEmailAction', 'Incorrect verification code', { 
            requestId: context.requestId,
            clientIP,
            email,
            userId: user.id,
            data: { attemptedCode: code }
        });
        return { message: t("incorrectCode") };
    }

    try {

        if (sessionGuest) {
            log.info('verifyEmailAction', 'Session found', { 
                requestId: context.requestId,
                clientIP
            });
            if (storeId) {
                await replaceGuestCart(storeId);
            }
            await replaceGuestAddress();
        }
        
        // Create session on successful verification
        const sessionToken = generateSessionToken();
        const session = await createSession(sessionToken, user.id);

        // Update user and clean up
        await setSessionTokenCookie(sessionToken, session.expiresAt);
        await deleteUserEmailVerificationRequest(user.id);
        await updateUserEmailAndSetEmailAsVerified(user.id, verificationRequest.email);
        await deleteEmailVerificationRequestCookie();
        await acceptTOS(user.email, TOS_VERSION, clientIP || "Not Available", "explicit", "login");
        revalidateTag('session');

        log.info('verifyEmailAction', 'Email verified and session created successfully', { 
            requestId: context.requestId,
            clientIP,
            email,
            userId: user.id 
        });

        return {
            session: await getCurrentSession()
        };
    } catch (error) {
        log.error('verifyEmailAction', 'Failed to create session after verification', { 
            requestId: context.requestId,
            clientIP,
            email,
            userId: user.id,
            error
        });
        return { message: t("problemWithAccount") };
    }
}

/**
 * Resends the email verification code to the user
 */
export async function resendEmailVerificationCodeAction(email: string): Promise<ActionResult> {
    const t = await getTranslations("app/(auth)/auth/actions");
    const context = await getRequestContext();
    const clientIP = context.clientIP || undefined;
    
    const normalizedEmail = email.toLowerCase();

    log.info('resendEmailVerificationCodeAction', 'Email resend attempt started', { 
        requestId: context.requestId,
        clientIP,
        email: normalizedEmail
    });

    const user = await getUserFromEmail(normalizedEmail);
    if (user === null) {
        log.warn('resendEmailVerificationCodeAction', 'Account does not exist', { 
            requestId: context.requestId,
            clientIP,
            email: normalizedEmail 
        });
        return { message: t("problemWithAccount") };
    }

    // Check rate limit for sending emails
    if (!sendVerificationEmailBucket.check(user.id, 1)) {
        log.warn('resendEmailVerificationCodeAction', 'Email rate limit hit', { 
            requestId: context.requestId,
            clientIP,
            email: normalizedEmail,
            userId: user.id
        });
        return { message: t("tooManyRequests") };
    }

    let verificationRequest = await getUserEmailVerificationRequestFromRequest(user.id);

    try {
        // Create or update verification request
        if (verificationRequest === null) {
            if (!sendVerificationEmailBucket.consume(user.id, 1)) {
                log.warn('resendEmailVerificationCodeAction', 'Email rate limit consumed', { 
                    requestId: context.requestId,
                    clientIP,
                    email: normalizedEmail,
                    userId: user.id
                });
                return { message: t("tooManyRequests") };
            }
            log.info('resendEmailVerificationCodeAction', 'Creating new verification request', { 
                requestId: context.requestId,
                clientIP,
                email: normalizedEmail,
                userId: user.id 
            });
            verificationRequest = await createEmailVerificationRequest(user.id, user.email);
        } else {
            if (!sendVerificationEmailBucket.consume(user.id, 1)) {
                log.warn('resendEmailVerificationCodeAction', 'Email rate limit consumed', { 
                    requestId: context.requestId,
                    clientIP,
                    email: normalizedEmail,
                    userId: user.id
                });
                return { message: t("tooManyRequests") };
            }
            log.info('resendEmailVerificationCodeAction', 'Updating existing verification request', { 
                requestId: context.requestId,
                clientIP,
                email: normalizedEmail,
                userId: user.id 
            });
            verificationRequest = await createEmailVerificationRequest(user.id, verificationRequest.email);
        }

        // Send email and set cookie
        await sendVerificationEmail(verificationRequest.email, verificationRequest.code);
        await setEmailVerificationRequestCookie(verificationRequest);
        
        log.info('resendEmailVerificationCodeAction', 'Verification email resent successfully', { 
            requestId: context.requestId,
            clientIP,
            email: normalizedEmail,
            userId: user.id 
        });
        return null;
    } catch (error) {
        log.error('resendEmailVerificationCodeAction', 'Failed to resend verification email', { 
            requestId: context.requestId,
            clientIP,
            email: normalizedEmail,
            userId: user.id,
            error 
        });
        return { message: t("problemSendingEmail") };
    }
}

/**
 * Sets a cookie containing the email verification request ID
 */
export async function setEmailVerificationRequestCookie(request: EmailVerificationRequest): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set("email_verification", request.id, {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: request.expiresAt
    });
}

/**
 * Deletes the email verification request cookie
 */
export async function deleteEmailVerificationRequestCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set("email_verification", "", {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0
    });
}

/**
 * Retrieves the email verification request from the cookie
 */
export async function getUserEmailVerificationRequestFromRequest(userId: string): Promise<EmailVerificationRequest | null> {
    const cookieStore = await cookies();
    const id = cookieStore.get("email_verification")?.value ?? null;

    if (id === null) {
        return null;
    }

    const request = await getUserEmailVerificationRequest(userId, id);
    if (request === null) {
        await deleteEmailVerificationRequestCookie();
    }

    return request;
}