import { useState, useEffect } from 'react';

import Cookies from "js-cookie";

type ConsentStatus = 'accepted' | 'rejected' | 'partial';

interface CookiePreferences {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
}

const COOKIE_CONSENT_KEY = 'cookie_consent';
const COOKIE_PREFERENCES_KEY = 'cookie_preferences';

const defaultPreferences: CookiePreferences = {
    necessary: true, // Always enabled
    analytics: true,
    marketing: true,
};

export default function useCookieConsent() {
    const [consent, setConsent] = useState<ConsentStatus | null>(null);
    const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

    useEffect(() => {
        const storedConsent = Cookies.get(COOKIE_CONSENT_KEY);
        const storedPreferences = Cookies.get(COOKIE_PREFERENCES_KEY);

        if (storedConsent) {
            setConsent(storedConsent as ConsentStatus);
        }

        if (storedPreferences) {
            setPreferences(JSON.parse(storedPreferences));
        }
    }, []);

    const acceptAll = () => {
        Cookies.set(COOKIE_CONSENT_KEY, 'accepted', { expires: 365 });
        Cookies.set(COOKIE_PREFERENCES_KEY, JSON.stringify({
            necessary: true,
            analytics: true,
            marketing: true,
        }), { expires: 365 });
        setConsent('accepted');
        setPreferences({
            necessary: true,
            analytics: true,
            marketing: true,
        });
    };

    const rejectAll = () => {
        Cookies.set(COOKIE_CONSENT_KEY, 'rejected', { expires: 365 });
        Cookies.set(COOKIE_PREFERENCES_KEY, JSON.stringify({
            necessary: true,
            analytics: false,
            marketing: false,
        }), { expires: 365 });
        setConsent('rejected');
        setPreferences({
            necessary: true,
            analytics: false,
            marketing: false,
        });
    };

    const savePreferences = (newPreferences: CookiePreferences) => {
        Cookies.set(COOKIE_PREFERENCES_KEY, JSON.stringify(newPreferences), { expires: 365 });

        const { analytics, marketing } = newPreferences;
        if (analytics || marketing) {
            Cookies.set(COOKIE_CONSENT_KEY, 'partial', { expires: 365 });
            setConsent('partial');
        } else {
            Cookies.set(COOKIE_CONSENT_KEY, 'rejected', { expires: 365 });
            setConsent('rejected');
        }

        setPreferences(newPreferences);
    };

    return {
        consent,
        preferences,
        acceptAll,
        rejectAll,
        savePreferences,
    };
}
