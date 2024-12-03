'use client';

import { useRouter } from 'next/navigation';
import React, {useState} from "react";
import {pacifico} from "@/components/fonts";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';
import {useInView} from "@/lib/hooks/useInView";
import {Image} from "@nextui-org/react";
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



    return (
        <div className="flex flex-col w-full lg:flex-row justify-center items-center min-h-screen overflow-hidden">
            <div className=" relative isolate px-6 pt-14 lg:px-8">
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
                <div className={`mx-auto max-w-2xl py-32 sm:py-48 lg:py-56`}
                >
                    <div className={`mb-8 flex sm:justify-center animate-fadeInUpDelay1`}
                    >
                        <div
                            className="text-tiny relative rounded-full shadow-border px-3 py-1 sm:text-sm/6 text-grayText ring-1 ring-grayBg hover:ring-grayBg">
                            Are you curious to know who we are?{' '}
                            <a href="/about-us" className="font-semibold text-primary">
                                <span aria-hidden="true" className="absolute inset-0"/>
                                Read more <span aria-hidden="true">&rarr;</span>
                            </a>
                        </div>
                    </div>
                    <div className="text-center">
                        <h1 className={`${pacifico.className} flex flex-col text-balance text-5xl font-semibold tracking-tight sm:text-7xl animate-fadeInUpDelay2`}>
                            <span>
                                Bake more.
                            </span>
                            <span>
                                Manage less.
                            </span>
                        </h1>
                        <p className={`mt-8 text-pretty flex flex-col text-lg font-medium text-gray-500 sm:text-xl/8 animate-fadeInUpDelay3`}>
                            <span>
                                TheBakerz is your receipt for success
                            </span>
                            <span>
                                One Platform, No Stress
                            </span>
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6 animate-fadeInUpDelay4">
                            <div className={`flex flex-col`}>
                                <Button
                                    isLoading={isLoading}
                                    disabled={isLoading}

                                    className={`py-6 -px-1 ${isLoading ? "px-6" : "-px-1"} text-2xl transition-transform transform hover:scale-105`}

                                    variant={"default"}
                                    onClick={handleCreate}
                                >
                                    {isLoading ? (
                                        <>
                                            Loading...
                                        </>
                                    ) : (
                                        <Gradient
                                            gradients={[
                                                ['#730C70', '#FAF4D1']
                                            ]}
                                            property="background"
                                            element="button"
                                            angle="90deg"
                                            transitionType="sequential"
                                            duration="3000"
                                            className={`py-10 px-6 text-2xl transition-transform transform scale-105`}

                                        >
                                            <div className={`flex flex-col`}>
                                                <span className={``}>
                                                    Get started
                                                </span>
                                            </div>
                                        </Gradient>
                                    )}
                                </Button>
                            </div>
                            <a href="#why-choose" className="text-sm/6 font-semibold text-text">
                                Learn more <span aria-hidden="true">&rarr;</span>
                            </a>
                        </div>
                    </div>
                    <Image
                        src="/images/PhoneDesign.png"
                        alt="Application Illustration"
                        className={`w-full h-auto transition-opacity duration-500 mt-10`}
                        width={678}
                    />
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
                        className="relative left-[calc(50%rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-11rem)]  sm:w-[73rem]"
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
            {/*<div className="w-full pt-12 mb-8 flex flex-col items-center text-center">*/}

            {/*    /!* Heading with Animation *!/*/}
            {/*    <h1*/}
            {/*        ref={headingRef}*/}
            {/*        className={`text-[38px] sm:text-[48px] md:text-[48px] lg:text-[8vh] font-bold*/}
            {/*                    opacity-0 transform translate-y-10 */}
            {/*                    ${headingInView ? 'animate-fadeInUp' : ''}`}*/}
            {/*    >*/}
            {/*        Stop getting lost in customer messages, orders, and recipes.*/}
            {/*    </h1>*/}

            {/*    /!* Image with Delayed Animation *!/*/}
            {/*    <div*/}
            {/*        ref={imageRef}*/}
            {/*        className={`mt-8 w-full h-auto */}
            {/*                    opacity-0 transform translate-y-10 */}
            {/*                    ${imageInView ? 'animate-fadeInUp' : ''}`}*/}
            {/*    >*/}
            {/*        {!isLoaded && <Skeleton height={500}/>}*/}

            {/*    </div>*/}

            {/*    /!* Subheading with Further Delayed Animation *!/*/}
            {/*    <p*/}
            {/*        ref={subheadingRef}*/}
            {/*        className={`text-[30px] sm:text-[42px] md:text-[42px] lg:text-[6vh] my-4 ${pacifico.className}*/}
            {/*                    opacity-0 transform translate-y-10*/}
            {/*                    ${subheadingInView ? 'animate-fadeInUp' : ''}`}*/}
            {/*    >*/}
            {/*        TheBakerz - the only platform you need to manage your business.*/}
            {/*    </p>*/}

            {/*    /!* Offer Text with Animation *!/*/}
            {/*    <div*/}
            {/*        ref={buttonRef}*/}
            {/*    >*/}


            {/*        /!* Button with Animation *!/*/}
            {/*        <div*/}
            {/*            className={`flex flex-col */}
            {/*                    opacity-0 transform translate-y-10 */}
            {/*                    ${buttonInView ? 'animate-fadeInUp' : ''}`}*/}
            {/*        >*/}
            {/*            <Button*/}
            {/*                isLoading={isLoading}*/}
            {/*                disabled={isLoading}*/}

            {/*                className="py-6 -px-1 text-2xl transition-transform transform hover:scale-105"*/}
            {/*                variant={"default"}*/}
            {/*                onClick={handleCreate}*/}
            {/*            >*/}
            {/*                {isLoading ? (*/}
            {/*                    <>*/}
            {/*                        Loading...*/}
            {/*                    </>*/}
            {/*                ) : (*/}
            {/*                    <Gradient*/}
            {/*                        gradients={[*/}
            {/*                            ['#730C70', '#FAF4D1']*/}
            {/*                        ]}*/}
            {/*                        property="background"*/}
            {/*                        element="button"*/}
            {/*                        angle="90deg"*/}
            {/*                        transitionType="sequential"*/}
            {/*                        duration="3000"*/}
            {/*                        className={`py-10 px-20 text-2xl transition-transform transform scale-105`}*/}

            {/*                    >*/}
            {/*                        Work with Bakerz*/}
            {/*                    </Gradient>*/}
            {/*                )}*/}
            {/*            </Button>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
    );
}