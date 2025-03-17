"use server";



import {globalPOSTRateLimit} from "@/lib/actions/requests";
import {deleteSessionTokenCookie, getCurrentSession, invalidateSession} from "@/lib/actions/session";
import {revalidateTag} from "next/cache";

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
    revalidateTag('session');

    return null;
}



import { revalidatePath } from 'next/cache';

export async function revalidateAndNavigate(path: string) {
    revalidatePath(path);
}

export type ActionResult = { message: string } | null;
