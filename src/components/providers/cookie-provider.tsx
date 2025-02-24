// context/CookieProvider.tsx
import React, { createContext, ReactNode } from 'react';
import useCookieConsent from "@/lib/hooks/useCookieConsent";

interface CookieConsentContextProps {
    consent: 'accepted' | 'rejected' | 'partial' | null;
    preferences: {
        necessary: boolean;
        analytics: boolean;
        marketing: boolean;
    };
    acceptAll: () => void;
    rejectAll: () => void;
    savePreferences: (preferences: {
        necessary: boolean;
        analytics: boolean;
        marketing: boolean;
    }) => void;
}

export const CookieProvider = createContext<CookieConsentContextProps>({
    consent: null,
    preferences: { necessary: true, analytics: false, marketing: false },
    acceptAll: () => {},
    rejectAll: () => {},
    savePreferences: () => {},
});

export const CookieConsentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { consent, preferences, acceptAll, rejectAll, savePreferences } = useCookieConsent();

    return (
        <CookieProvider.Provider
            value={{ consent, preferences, acceptAll, rejectAll, savePreferences }}
        >
            {children}
        </CookieProvider.Provider>
    );
};
