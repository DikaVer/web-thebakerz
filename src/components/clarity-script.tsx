// components/ClarityScript.tsx
"use client";
import clarity from "@microsoft/clarity";
import {useEffect} from "react";
import {CookiePreferences} from "@/lib/cookie";
import { getSessionCookieOrCreate } from "@/lib/cookie";
export default function ClarityScript({id, preferences} : {id?: string, preferences: CookiePreferences | null}) {


    const getClarityId = async () => {
        const idClarity = id || await getSessionCookieOrCreate();
        return idClarity;
    }


    useEffect(() => {
        if(process.env.NODE_ENV === "production" && id) {
            clarity.init("qh4dvfidc3");
            clarity.identify(id);
            if(preferences) {
                clarity.consent(preferences.analytics);
            }
        } else if (process.env.NODE_ENV === "production") {
            clarity.init("qh4dvfidc3");
            getClarityId().then((id) => {
                clarity.identify(id);
                if(preferences) {
                    clarity.consent(preferences.analytics);
                }
            });
        }
    }, []);
    return null;
}
