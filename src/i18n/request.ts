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