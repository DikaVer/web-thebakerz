'use client';

import { useRouter } from 'next/navigation';
import React, {useState} from "react";
import { pacifico } from "@/components/fonts";
import 'react-loading-skeleton/dist/skeleton.css';
import { useInView } from "@/lib/hooks/useInView";
import { Image } from "@nextui-org/react";

import { Button } from "@/components/ui/button";

export function FirstView() {
    const router = useRouter();
    const [isLoading, setLoading] = useState(false);

    const handleCreate = () => {
        setLoading(true);
        router.push('/application');
        router.refresh();
    };

    const [aboutusRef, aboutusInView] = useInView<HTMLHeadingElement>({ threshold: 0 });

    const [headingRef, headingInView] = useInView<HTMLHeadingElement>({ threshold: 0 });
    const [imageRef, imageInView] = useInView<HTMLDivElement>({ threshold: 0 });
    const [subheadingRef, subheadingInView] = useInView<HTMLParagraphElement>({ threshold: 0 });
    const [buttonRef, buttonInView] = useInView<HTMLDivElement>({ threshold: 0 });

    return (
        <div className="flex flex-col w-full lg:flex-row justify-center items-center min-h-screen overflow-hidden">
            <div className="relative isolate px-6 pt-14 lg:px-8">
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                >
                    <div
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                    />
                </div>
                <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
                    <div className={`mb-8 flex sm:justify-center ${aboutusInView ? 'animate-fadeInUpDelay1' : ""} opacity-0`}
                        ref={aboutusRef}
                    >
                        <div className="text-tiny relative rounded-full shadow-border px-3 py-1 sm:text-sm/6 text-grayText ring-1 ring-grayBg hover:ring-grayBg">
                            Are you curious to know who we are?{' '}
                            <a href="/about-us" className="font-semibold text-primary">
                                <span aria-hidden="true" className="absolute inset-0" />
                                Read more <span aria-hidden="true">&rarr;</span>
                            </a>
                        </div>
                    </div>
                    <div className="text-center">
                        <h1 ref={headingRef} className={`${pacifico.className} flex flex-col text-balance text-5xl font-semibold tracking-tight sm:text-7xl opacity-0 ${headingInView ? 'animate-fadeInUpDelay2' : ''}`}>
                            <span>Bake more.</span>
                            <span>Manage less.</span>
                        </h1>
                        <p ref={subheadingRef} className={`mt-8 text-pretty flex flex-col text-lg font-medium text-gray-500 sm:text-xl/8  opacity-0 ${subheadingInView ? 'animate-fadeInUpDelay3' : ''}`}>
                            <span>TheBakerz is your recipe for success</span>
                            <span>One Platform, Zero Stress</span>
                        </p>
                        <div ref={buttonRef} className={`mt-10 flex items-center justify-center gap-x-6 opacity-0 ${buttonInView ? 'animate-fadeInUpDelay4' : ''}`}>
                            <div className="flex flex-col">

                                    <Button
                                        isLoading={isLoading}
                                        disabled={isLoading}
                                        className={`py-6 -px-1 ${isLoading ? "px-6" : "-px-1"} gradient-background text-2xl`}
                                        variant={"default"}
                                        onPress={handleCreate}
                                    >
                                        <>

                                            {isLoading ? (
                                                <>Loading...</>
                                            ) : (
                                                <div className="px-6 flex flex-col"
                                                >
                                                    Get started
                                                </div>
                                            )}
                                        </>
                                    </Button>
                            </div>
                            <a href="#why-choose" className="text-sm/6 font-semibold text-text">
                                Learn more <span aria-hidden="true">&rarr;</span>
                            </a>
                        </div>
                    </div>
                    <div
                        className={`transition-opacity duration-500 opacity-0 ${imageInView ? 'animate-fadeInUpDelay5' : ''}`}
                        ref={imageRef}>
                        <Image
                            src="/images/PhoneDesign.png"
                            alt="Application Illustration"
                            className={`w-full h-auto transition-opacity duration-500 mt-10`}
                            width={678}
                        />
                    </div>
                </div>
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-[calc(60%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(65%-30rem)]"
                >
                    <div
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                        className="relative left-[calc(50%rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-11rem)] sm:w-[73rem]"
                    />
                </div>
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
                >
                    <div
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                        className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                    />
                </div>
            </div>
        </div>
    );
}