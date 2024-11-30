import { ExternalLink } from '@/components/external-link'
import {pacifico} from "@/components/fonts";
import Image from "next/image";
import React from "react";

export default async function NotFound() {
    return (
        <>
            <div className="flex flex-col mb-20 min-h-screen">
                <div className="z-10 flex flex-col justify-center items-center container mx-auto text-center ">
                    <p className={`text-3xl my-10 ${pacifico.className}`}>Sorry, this page isn&apos;t available.</p>
                    <div className="w-2/3 h-2/3 ml-14 mb-2">
                        <Image
                            src="/images/Search.svg"
                            alt="Verify Email Image"
                            width={200} // Adjust based on desired size
                            height={200} // Adjust based on desired size
                            className="w-full h-full"
                            priority
                        />
                    </div>
                    <p>
                        The link you followed may be broken, or the page may have been removed.
                    </p>
                    <ExternalLink href="/">
                        Go back to TheBakerz
                    </ExternalLink>
                </div>
            </div>
        </>
    );
}

export async function ComingSoon() {
    return (
        <>
            <div className={`flex flex-col gap-y-10 my-10 items-center justify-center min-h-screen`}>
                <p className={`text-5xl ${pacifico.className}`}>
                    Coming Soon!
                </p>
                <div className="w-2/3 h-2/3">
                    <Image
                        src="/images/HomeBaker.svg"
                        alt="Home Baker Image"
                        width={200} // Adjust based on desired size
                        height={200} // Adjust based on desired size
                        className="w-full h-full"
                        priority
                    />
                </div>
            </div>
        </>
    );
}