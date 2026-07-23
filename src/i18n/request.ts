/**
 * @fileoverview Per-request next-intl configuration for server-side translations.
 *
 * Resolves the active locale from the language cookie (falling back to English)
 * and dynamically imports the matching JSON message catalog from the messages
 * directory.
 */

import {getRequestConfig} from 'next-intl/server';
import {getLanguageCookie} from "@/lib/actions/cookies/language";

export default getRequestConfig(async () => {
    // Provide a static locale, fetch a user setting,
    // read from `cookies()`, `headers()`, etc.
    const lang = await getLanguageCookie();

    const locale = lang || "en";

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default
    };
});