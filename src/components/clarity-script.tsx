/**
 * @fileoverview Microsoft Clarity analytics initializer.
 *
 * Exports ClarityScript, a client component that initializes the Microsoft
 * Clarity tracking SDK with the project id on mount and renders nothing. It
 * is included in the app layout to enable session recording and analytics.
 */
"use client";
import clarity from "@microsoft/clarity";
import {useEffect} from "react";

export default function ClarityScript() {


    useEffect(() => {
        clarity.init("qh4dvfidc3");
    }, []);
    return null;
}
