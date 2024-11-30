'use client';

import { useRouter } from 'next/navigation';
import Image from "next/image";
import React, {useState} from "react";
import {pacifico} from "@/components/fonts";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';
import {useInView} from "@/lib/hooks/useInView";

// @ts-ignore
import {Gradient} from "react-gradient";
import {Button} from "@/components/ui/button";




export function FirstView() {
    // Inside your component
    const router = useRouter();

    const [isLoading, setLoading] = useState(false);

    const handleCreate = () => {
        setLoading(true);
        router.push('/application');
        router.refresh();
    };

    const [isLoaded, setIsLoaded] = useState(false);

    // Initialize refs and inView states for each animated element
    const [headingRef, headingInView] = useInView<HTMLHeadingElement>({ threshold: 0 });
    const [imageRef, imageInView] = useInView<HTMLDivElement>({ threshold: 0 });
    const [subheadingRef, subheadingInView] = useInView<HTMLParagraphElement>({ threshold: 0 });
    const [buttonRef, buttonInView] = useInView<HTMLDivElement>({ threshold: 0 });

    return (
        <div className="flex flex-col lg:flex-row justify-center items-center min-h-screen overflow-hidden">
            <div className="w-full py-12 flex flex-col items-center text-center">

                {/* Heading with Animation */}
                <h1
                    ref={headingRef}
                    className={`text-[38px] sm:text-[48px] md:text-[48px] lg:text-[8vh] font-bold
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
                    className={`text-[30px] sm:text-[42px] md:text-[42px] lg:text-[6vh] my-4 ${pacifico.className}
                                opacity-0 transform translate-y-10
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
                                isLoading={isLoading}
                                disabled={isLoading}

                                className="py-6 -px-1 rounded-lg text-2xl transition-transform transform hover:scale-105"
                                variant={"default"}
                                onClick={handleCreate}
                                spinner={
                                    <svg
                                        className="animate-spin h-5 w-5 text-current"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                }
                            >
                                <Gradient
                                    gradients={[
                                        ['#730C70', '#FAF4D1']
                                    ]}
                                    property="background"
                                    element="button"
                                    angle="90deg"
                                    transitionType="sequential"
                                    duration="3000"
                                    className={`py-10 px-20 rounded-lg text-2xl transition-transform transform scale-105 ${isLoading ? 'opacity-0' : 'opacity-100'}`}

                                >
                                {isLoading ? "Loading" : "Work with Bakerz"}
                                </Gradient>
                            </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}