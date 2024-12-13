"use client";

import { pacifico } from "@/components/fonts";
import { ClipLoader } from "react-spinners";
import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Page() {
    const nextParams = useSearchParams();
    const next = nextParams.get('next') as string;

    const router = useRouter();

    useEffect(() => {
        router.push(next ? next : "/");
        router.refresh();
    }, [next, router]); // Added 'next' and 'router' as dependencies

    return (
        <div className="z-10 flex-grow container mx-auto text-center min-h-screen">
            <div className="flex flex-col justify-center items-center mb-12">
                <div className="flex flex-col min-h-screen justify-center items-center">
                    <ClipLoader
                        color="#730C6F"
                        loading={true}
                        size={500}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                        speedMultiplier={0.3}
                    />
                    <p className={`text-4xl md:text-8xl my-10 ${pacifico.className}`}>
                        Performing sign out...
                    </p>
                </div>
            </div>
        </div>
    );
}