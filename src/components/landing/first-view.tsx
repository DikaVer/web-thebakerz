'use client';

import { useRouter } from 'next/navigation';
import {Button} from "@/components/ui/button";
import Image from "next/image";
import React, {useState} from "react";
import {pacifico} from "@/components/fonts";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';
import {useInView} from "@/lib/hooks/useInView";




export function FirstView() {
    // Inside your component
    const router = useRouter();

    const handleCreate = () => {
        router.push('/apply')
        router.refresh()
    };

    const [isLoaded, setIsLoaded] = useState(false);

    // Initialize refs and inView states for each animated element
    const [headingRef, headingInView] = useInView<HTMLHeadingElement>({ threshold: 0 });
    const [imageRef, imageInView] = useInView<HTMLDivElement>({ threshold: 0 });
    const [subheadingRef, subheadingInView] = useInView<HTMLParagraphElement>({ threshold: 0 });
    const [buttonRef, buttonInView] = useInView<HTMLDivElement>({ threshold: 0 });

    return (
        <div className="flex flex-col lg:flex-row justify-center items-center min-h-screen overflow-hidden">
            <div className="bg-white w-full py-12 flex flex-col items-center text-center">

                {/* Heading with Animation */}
                <h1
                    ref={headingRef}
                    className={`text-[38px] sm:text-[48px] md:text-[64px] lg:text-8xl font-bold
                                opacity-0 transform translate-y-10 
                                ${headingInView ? 'animate-fadeInUp' : ''}`}
                >
                    Stop getting lost in customer messages, orders, and recipes.
                </h1>

                {/* Image with Delayed Animation */}
                <div
                    ref={imageRef}
                    className={`mt-8 w-full h-auto 
                                opacity-0 transform translate-y-10 
                                ${imageInView ? 'animate-fadeInUp' : ''}`}
                >
                    {!isLoaded && <Skeleton height={500} />}
                    <Image
                        src="/images/PhoneDesign.png"
                        alt="Application Illustration"
                        className={`w-full h-auto transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                        width={3478}
                        height={3188}
                        quality={100}
                        priority
                        onLoad={() => setIsLoaded(true)}
                    />
                </div>

                {/* Subheading with Further Delayed Animation */}
                <p
                    ref={subheadingRef}
                    className={`text-[30px] sm:text-[42px] md:text-[51px] lg:text-6xl my-4 ${pacifico.className}
                                opacity-0 transform translate-y-10 text-gray-900
                                ${subheadingInView ? 'animate-fadeInUp' : ''}`}
                >
                    TheBakerz - the only platform you need to manage your business.
                </p>

                {/* Offer Text with Animation */}
                <div
                    ref={buttonRef}
                >
                    <p
                        className={`text-base girl-md:text-lg italic text-primary mb-4 mt-8 
                                opacity-0 transform translate-y-10 
                                ${buttonInView ? 'animate-fadeInUp' : ''}`}
                    >
                        Exclusive offer: start for 3 months for free!
                    </p>

                    {/* Button with Animation */}
                    <div
                        className={`flex flex-col 
                                opacity-0 transform translate-y-10 
                                ${buttonInView ? 'animate-fadeInUp' : ''}`}
                    >
                        <Button
                            className="py-6 px-6 rounded-lg text-2xl transition-transform transform hover:scale-105"
                            variant="default"
                            onClick={handleCreate}
                        >
                            Create a bakery account
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}