"use client";

import { pacifico } from "@/components/fonts";
import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {IconLoadingCircle} from "@/components/ui/icons";

export default function Page() {
    const nextParams = useSearchParams();
    const next = nextParams.get('next') as string;

    const router = useRouter();

    useEffect(() => {
        router.refresh();

        router.push(next ? next : "/");
    }, [next, router]); // Added 'next' and 'router' as dependencies

    return (
        <div className="z-10 flex-grow container mx-auto text-center min-h-screen">
            <div className="flex flex-col justify-center items-center mb-12">
                <div className="flex flex-col min-h-screen justify-center items-center">
                    <IconLoadingCircle strokeWidth={3} className="text-grayText w-20 h-20" />
                    <p className={`text-4xl md:text-8xl my-10 ${pacifico.className}`}>
                        Performing sign out...
                    </p>
                </div>
            </div>
        </div>
    );
}