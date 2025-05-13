// components/ClarityScript.tsx
"use client";
import clarity from "@microsoft/clarity";
import {useEffect} from "react";

export default function ClarityScript() {


    useEffect(() => {
        clarity.init("qh4dvfidc3");
    }, []);
    return null;
}
