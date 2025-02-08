"use server";


import {globalPOSTRateLimit} from "@/lib/actions/requests";
import {deleteSessionTokenCookie, getCurrentSession, invalidateSession} from "@/lib/actions/session";

export async function logoutAction(): Promise<ActionResult> {
    if (!await globalPOSTRateLimit()) {
        return {
            message: "Too many requests"
        };
    }
    const { session } = await getCurrentSession();
    if (session === null) {
        return {
            message: "Not authenticated"
        };
    }
    await invalidateSession(session.id);
    await deleteSessionTokenCookie();
    return null;
}

export type ActionResult = { message: string } | null;
