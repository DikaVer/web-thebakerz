/**
 * @fileoverview Partner landing page at /become-partner for recruiting bakeries.
 *
 * Client component that composes marketing sections: a Macbook scroll demo,
 * video showcase, partner application form, partner logos, and a support
 * section.
 */
"use client";

import React from "react";
import ApplyComponent from "@/components/landing/apply-component";
import SupportComponent from "@/components/support/support-component";
import { MacbookScrollDemo } from "@/components/landing/MacbookScrollDemo";
import { VideoShowcase } from "@/components/landing/video-showcase";
import Partners from "@/components/landing/partners";

export default function Page() {
    return (
        <div className={'flex w-full h-full flex-col items-center justify-center'}>
            <MacbookScrollDemo />
            <VideoShowcase />
            <div className={'flex w-full h-full mt-20 items-center justify-center px-4'}>
                <ApplyComponent/>
            </div>
            <Partners />
            <SupportComponent/>
        </div>
    );
}


