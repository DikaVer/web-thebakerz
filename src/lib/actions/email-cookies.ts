// 'use server';
// import { cookies } from "next/headers";
// import { EmailVerificationRequest, getUserEmailVerificationRequest } from "@/lib/actions/email-verification";
// import { getCurrentSession } from "@/lib/actions/session";
//
// export async function setEmailVerificationRequestCookie(request: EmailVerificationRequest): Promise<void> {
//     // This function must be called from a Server Action or Route Handler.
//     const cookieStore = await cookies();
//     cookieStore.set("email_verification", request.id, {
//         httpOnly: true,
//         path: "/",
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax",
//         expires: request.expiresAt
//     });
// }
//
// export async function deleteEmailVerificationRequestCookie(): Promise<void> {
//     const cookieStore = await cookies();
//     cookieStore.set("email_verification", "", {
//         httpOnly: true,
//         path: "/",
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax",
//         maxAge: 0
//     });
// }
//
// export async function getUserEmailVerificationRequestFromRequest(): Promise<EmailVerificationRequest | null> {
//     const { user } = await getCurrentSession();
//     if (user === null) {
//         return null;
//     }
//     const cookieStore = await cookies();
//     const id = cookieStore.get("email_verification")?.value ?? null;
//     if (id === null) {
//         return null;
//     }
//     const request = getUserEmailVerificationRequest(user.id, id);
//     if (request === null) {
//         await deleteEmailVerificationRequestCookie();
//     }
//     return request;
// }
