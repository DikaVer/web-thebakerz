"use server";

import {cookies} from "next/headers";
import {Locale} from "@/lib/i18n";

export async function setLanguageCookie(lang: Locale) {
    // Set a cookie named "language" with the chosen locale
    const cookie = await cookies();
    cookie.set({
        name: 'language',
        value: lang,
        path: '/',               // cookie available site-wide
        maxAge: 60 * 60 * 24 * 15    // 15 day in seconds
    });
}

export async function getLanguageCookie(): Promise<Locale> {
    const cookieStore = await cookies();
    return cookieStore.get('language')?.value as Locale;
}
