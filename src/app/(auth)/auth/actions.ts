"use server";

import {RefillingTokenBucket} from "@/lib/actions/rate-limits";
import {
    createSession,
    generateSessionToken,
    getCurrentSession,
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
export async function loginAction(_prev: ActionResult, formData: z.infer<typeof EmailSchema>): Promise<ActionResult> {
    // Check global rate limit
    if (!await globalPOSTRateLimit()) {
        return { message: "Too many requests" };
    }

    // Check IP-based rate limit
    const reqHeaders = await headers();
    const clientIP = reqHeaders.get("x-forwarded-for");
    if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
        return { message: "Too many requests" };
    }

    // Validate email
    const validation = EmailSchema.safeParse(formData);
    if (!validation.success) {
        return { message: "Invalid or missing field" };
    }

    // Consume rate limit token
    if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
        return { message: "Too many requests" };
    }

    const email = formData.email;

    // Get or create user
    let user: User | null = await getUserFromEmail(email);
    if (user === null) {
        user = await createUser(email);
    }

    // Create and send verification email
    const emailVerificationRequest = await createEmailVerificationRequest(user.id, user.email);
    await sendVerificationEmail(emailVerificationRequest.email, emailVerificationRequest.code);
    await setEmailVerificationRequestCookie(emailVerificationRequest);

    return null;
}

/**
 * Verifies the email using the OTP code provided
 */
export async function verifyEmailAction(_prev: ActionLogin, formData: z.infer<typeof OTPSchema>): Promise<ActionLogin> {
    // Check global rate limit
    if (!await globalPOSTRateLimit()) {
        return { message: "Too many requests" };
    }

    // Validate OTP input
    const validation = OTPSchema.safeParse(formData);
    if (!validation.success) {
        return { message: "Invalid or missing fields" };
    }

    const email = formData.email;
    const user = await getUserFromEmail(email);
    if (user === null) {
        return { message: "Account does not exist" };
    }

    const code = formData.otp;

    // Check IP-based rate limit
    const reqHeaders = await headers();
    const clientIP = reqHeaders.get("x-forwarded-for");
    if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
        return { message: "Too many requests" };
    }

    // Get verification request
    let verificationRequest = await getUserEmailVerificationRequestFromRequest(user.id);
    if (verificationRequest === null) {
        return { message: "Not authenticated" };
    }

    // Consume rate limit token
    if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
        return { message: "Too many requests" };
    }

    // Handle expired verification code
    if (Date.now() >= verificationRequest.expiresAt.getTime()) {
        verificationRequest = await createEmailVerificationRequest(verificationRequest.userId, verificationRequest.email);
        await sendVerificationEmail(verificationRequest.email, verificationRequest.code);
        return { message: "The verification code was expired. We sent another code to your email." };
    }

    // Check code validity
    if (verificationRequest.code !== code) {
        return { message: "Incorrect code." };
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

    return {
        session: await getCurrentSession()
    };
}

/**
 * Resends the email verification code to the user
 */
export async function resendEmailVerificationCodeAction(email: string): Promise<ActionResult> {
    const user = await getUserFromEmail(email);
    if (user === null) {
        return { message: "Problem with account" };
    }

    // Check rate limit for sending emails
    if (!sendVerificationEmailBucket.check(user.id, 1)) {
        return { message: "Too many requests" };
    }

    let verificationRequest = await getUserEmailVerificationRequestFromRequest(user.id);

    // Create or update verification request
    if (verificationRequest === null) {
        if (!sendVerificationEmailBucket.consume(user.id, 1)) {
            return { message: "Too many requests" };
        }
        verificationRequest = await createEmailVerificationRequest(user.id, user.email);
    } else {
        if (!sendVerificationEmailBucket.consume(user.id, 1)) {
            return { message: "Too many requests" };
        }
        verificationRequest = await createEmailVerificationRequest(user.id, verificationRequest.email);
    }

    // Send email and set cookie
    await sendVerificationEmail(verificationRequest.email, verificationRequest.code);
    await setEmailVerificationRequestCookie(verificationRequest);
    return null;
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