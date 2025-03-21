// components/ClarityScript.tsx
"use client";
import clarity from "@microsoft/clarity";
import {useEffect} from "react";
import {CookiePreferences} from "@/lib/cookie";

export default function ClarityScript({id, preferences} : {id?: string, preferences: CookiePreferences | null}) {



    useEffect(() => {
        clarity.init("qh4dvfidc3");

        if(id) {
            clarity.identify(id);
        }

        if(preferences) {
            clarity.consent(preferences.analytics);
        }
    }, []);
    return null;
}
