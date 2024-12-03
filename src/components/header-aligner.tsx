'use client';

import React, { ReactNode } from "react";
import {useIsMobile} from "@/lib/hooks/use-mobile";

export const HeaderAligner = ({ children, menuItems}: { children: ReactNode, menuItems: React.ReactNode }) => {

    const isMobile = useIsMobile();

    return (
        <div className={'flex flex-row'}>
            {isMobile ? null : menuItems}
            <div className={'w-full flex-1'}>
                {children}
            </div>
        </div>
    );
};