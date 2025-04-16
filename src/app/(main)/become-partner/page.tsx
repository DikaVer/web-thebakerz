"use client";

import React from "react";
import ApplyComponent from "@/components/landing/apply-component";
import SupportComponent from "@/components/support/support-component";
import { MacbookScrollDemo } from "@/components/landing/MacbookScrollDemo";
import HorizontalScroll from "@/components/landing/horizontal-scroll";

export default function Page() {
    return (
        <div className={'flex w-full h-full flex-col items-center justify-center'}>
            <MacbookScrollDemo />
            <HorizontalScroll />
            <div className={'flex w-full h-full mt-20 items-center justify-center px-4'}>
                <ApplyComponent/>
            </div>
            <SupportComponent/>
        </div>
    );
}


