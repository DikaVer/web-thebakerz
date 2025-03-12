"use server";

import {ExpiringTokenBucket, RefillingTokenBucket} from "@/lib/actions/rate-limits";
import {
    createSession,
    generateSessionToken,
    getCurrentSession,
    SessionValidationResult,
    setSessionTokenCookie
} from "@/lib/actions/session";
import { headers } from "next/headers";
import { globalPOSTRateLimit} from "@/lib/actions/requests";

import {createUser, getUserFromEmail, updateUserEmailAndSetEmailAsVerified, User} from "@/lib/actions/user";


import {z} from "zod";
import {EmailSchema, OTPSchema} from "@/lib/schemas";
import {
    createEmailVerificationRequest,
    deleteUserEmailVerificationRequest, EmailVerificationRequest, getUserEmailVerificationRequest,
    sendVerificationEmail, sendVerificationEmailBucket
} from "@/lib/actions/auth/email-verification";


const ipBucket = new RefillingTokenBucket<string>(20, 1);

export async function loginAction(_prev: ActionResult, formData: z.infer<typeof EmailSchema>): Promise<ActionResult> {
    if (!await globalPOSTRateLimit()) {
        return {
            message: "Too many requests"
        };
    }
    // TODO: Assumes X-Forwarded-For is always included.
    const reqHeaders = await headers();
    const clientIP = reqHeaders.get("x-forwarded-for");
    if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
        return {
            message: "Too many requests"
        };
    }

    // TODO: Implement zod schema validation
    const email = formData.email;

    const validation = EmailSchema.safeParse(formData);
    if (!validation.success) {
        return {
            message: "Invalid or missing field"
        };
    }


    if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
        return {
            message: "Too many requests"
        };
    }

    let user: User | null = await getUserFromEmail(email as string);
    if (user === null) {
        user = await createUser(email as string);
    }

    const emailVerificationRequest = await createEmailVerificationRequest(user.id, user.email);
    await sendVerificationEmail(emailVerificationRequest.email, emailVerificationRequest.code);
    await setEmailVerificationRequestCookie(emailVerificationRequest);

    return null;
}



export async function verifyEmailAction(_prev: ActionLogin, formData: z.infer<typeof OTPSchema>): Promise<ActionLogin> {
    if (!await globalPOSTRateLimit()) {
        return {
            message: "Too many requests"
        };
    }

    const validation = OTPSchema.safeParse(formData);
    if (!validation.success) {
        return {
            message: "Invalid or missing fields"
        };
    }

    const email = formData.email;
    const user = await getUserFromEmail(email);
    if (user === null) {
        return {
            message: "Account does not exist"
        };
    }

    const code = formData.otp;


    const reqHeaders = await headers();
    const clientIP = reqHeaders.get("x-forwarded-for");
    if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
        return {
            message: "Too many requests"
        };
    }

    let verificationRequest = await getUserEmailVerificationRequestFromRequest(user?.id);


    if (verificationRequest === null) {
        return {
            message: "Not authenticated"
        };
    }


    if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
        return {
            message: "Too many requests"
        };
    }

    if (Date.now() >= verificationRequest.expiresAt.getTime()) {
        verificationRequest = await createEmailVerificationRequest(verificationRequest.userId, verificationRequest.email);
        await sendVerificationEmail(verificationRequest.email, verificationRequest.code);
        return {
            message: "The verification code was expired. We sent another code to your email."
        };
    }
    if (verificationRequest.code !== code) {
        return {
            message: "Incorrect code."
        };
    }


    const sessionToken =  generateSessionToken();
    const session = await createSession(sessionToken, user.id);

    await setSessionTokenCookie(sessionToken, session.expiresAt);
    await deleteUserEmailVerificationRequest(user.id);
    await updateUserEmailAndSetEmailAsVerified(user.id, verificationRequest.email);
    await deleteEmailVerificationRequestCookie();
    await acceptTOS(user.email, TOS_VERSION, clientIP || "Not Available", "explicit", "login");
    revalidateTag('session');

    return await getCurrentSession();
}

export async function resendEmailVerificationCodeAction(email: string): Promise<ActionResult> {

    const user = await getUserFromEmail(email);

    if (user === null) {
        return {
            message: "Problem with account"
        };
    }

    if (!sendVerificationEmailBucket.check(user.id, 1)) {
        return {
            message: "Too many requests"
        };
    }
    let verificationRequest = await getUserEmailVerificationRequestFromRequest(user.id);
    if (verificationRequest === null) {
        if (!sendVerificationEmailBucket.consume(user.id, 1)) {
            return {
                message: "Too many requests"
            };
        }
        verificationRequest = await createEmailVerificationRequest(user.id, user.email);
    } else {
        if (!sendVerificationEmailBucket.consume(user.id, 1)) {
            return {
                message: "Too many requests"
            };
        }
        verificationRequest = await createEmailVerificationRequest(user.id, verificationRequest.email);
    }
    await sendVerificationEmail(verificationRequest.email, verificationRequest.code);
    await setEmailVerificationRequestCookie(verificationRequest);
    return null;
}

import { cookies } from "next/headers";
import {revalidateTag} from "next/cache";
import {acceptTOS} from "@/lib/term-of-service";
import {TOS_VERSION} from "@/lib/local-variables";


export async function setEmailVerificationRequestCookie(request: EmailVerificationRequest): Promise<void> {
    // This function must be called from a Server Action or Route Handler.
    const cookieStore = await cookies();
    cookieStore.set("email_verification", request.id, {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: request.expiresAt
    });
}

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


export type ActionResult = { message: string } | null ;

export type ActionLogin = { message: string } | SessionValidationResult;
