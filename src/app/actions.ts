"use server";

import {globalPOSTRateLimit} from "@/lib/actions/requests";
import {deleteSessionTokenCookie, getCurrentSession, invalidateSession} from "@/lib/actions/session";
import {revalidateTag} from "next/cache";
import {getTranslations} from "next-intl/server";

export async function logoutAction(): Promise<ActionResult> {
    const t = await getTranslations("app/actions");

    if (!await globalPOSTRateLimit()) {
        return {
            message: t("tooManyRequests")
        };
    }
    const { session } = await getCurrentSession();
    if (session === null) {
        return {
            message: t("notAuthenticated")
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
