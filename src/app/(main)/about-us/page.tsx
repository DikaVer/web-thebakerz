import {pacifico} from "@/components/fonts";
import Image from 'next/image';
import React from "react";
import {FollowUs} from "@/components/about-us/follow-us";
import type {Metadata} from "next";
import {getLocalizedMetadata, metadataDefault} from "@/components/metadata";
import {getLocale, getTranslations} from "next-intl/server"; // Add this import

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();

    return {
        ...getLocalizedMetadata(locale),
        title: "About Us | The Team Behind Your Bakery Success",
        description: "Meet the passionate team behind TheBakerz - dedicated to helping artisanal bakers grow their businesses with innovative tools and personalized support.",
        openGraph: {
            ...metadataDefault.openGraph,
            title: "About Us | The Team Behind Your Bakery Success",
            description: "Meet the passionate team behind TheBakerz - dedicated to helping artisanal bakers grow their businesses with innovative tools and personalized support.",
            url: 'https://www.thebakerz.com/about-us/',
        },
        twitter: {
            ...metadataDefault.twitter,
            title: "About Us | The Team Behind Your Bakery Success",
            description: "Meet the passionate team behind TheBakerz - dedicated to helping artisanal bakers grow their businesses with innovative tools and personalized support.",
        },
        keywords: "TheBakerz team, bakery platform developers, artisanal bakery support, bakery tech innovators, baker community, bakery business experts, bakery management team",
        alternates: {
            ...metadataDefault.alternates,
            canonical: 'https://www.thebakerz.com/about-us/',
            languages: {
                'nl-NL': 'https://www.thebakerz.com/about-us/',
                'en-NL': 'https://www.thebakerz.com/about-us/',
            }
        }
    };
}


export default async function Page() {
    const t = await getTranslations("About Us"); // Initialize translations

    return (
        <div className="flex flex-col min-h-screen">
            <main className="z-10 grid container mx-auto py-6 gap-y-3 text-[#1F2937]">
                <section id={'nice-to-meet-you'}>
                    <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 relative">
                        <div
                            className="flex items-center justify-center bg-gradient-secondary to-white rounded-none rounded-b-lg lg:rounded-none lg:rounded-l-lg">
                            <div
                                className="justify-center max-w-[620px] flex flex-col h-full lg:text-left px-4 py-12 lg:px-12 mx-auto lg:mx-0">

                                <h2 className={`text-left text-4xl lg:text-6xl font-bold mb-10 ${pacifico.className}`}>
                                    {t("Greeting title")}
                                </h2>

                                <div className="mb-6 text-md lg:text-lg font-light ">
                                    <p className={'text-left'}>
                                        {t("greeting")}
                                    </p>
                                </div>

                            </div>
                        </div>
                        <div className="relative w-full h-[500px] lg:h-auto">
                            <Image
                                src="/images/hero.webp"
                                alt="TheBakerz Hero"
                                fill
                                className="object-cover rounded-none rounded-t-lg lg:rounded-none lg:rounded-r-lg"
                                priority
                            />
                        </div>
                    </div>
                </section>
                <section id={'bake-more-manage-less'}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 relative bg-gradient-secondary rounded-lg">
                        <div
                            className="relative overflow-hidden w-full">

                            <div className={`h-full flex justify-center`}>
                                <Image
                                    src="/images/HomeKitchen.svg"
                                    alt="TheBakerz Hero"
                                    width={1920}
                                    height={1536}
                                    className="rounded-none rounded-t-lg lg:rounded-none lg:rounded-r-lg"
                                    priority
                                />
                            </div>

                        </div>
                        <div
                            className="flex items-center justify-center">
                            <div
                                className="justify-center max-w-[620px] flex flex-col h-full lg:text-left px-4 py-12 lg:px-12 mx-auto lg:mx-0">

                                <h2 className="text-3xl lg:text-5xl font-bold mb-4">
                                    {t("Slogan title")}
                                </h2>

                                <div className="mb-6 text-md lg:text-lg font-light">
                                    <p>
                                        {t("slogan")}
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>
                </section>
                <section id={'bake-more-manage-less'}>
                    <div className="flex flex-col lg:grid lg:grid-cols-2 relative">
                        <div className="flex items-center justify-center bg-gradient-secondary rounded-lg">
                            <div
                                className="justify-center max-w-[620px] flex flex-col h-full lg:text-left px-4 py-12 lg:px-12 mx-auto lg:mx-0">

                                <h2 className="text-3xl lg:text-5xl font-bold mb-4">
                                    {t("why title")}
                                </h2>

                                <div className="mb-6 text-md lg:text-lg font-light">
                                    <p>
                                        {t("why")}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center text-text">
                            <div
                                className="justify-center max-w-[620px] flex flex-col h-full lg:text-left px-4 py-12 lg:px-12 mx-auto lg:mx-0">

                                <h2 className={`text-4xl lg:text-6xl font-bold text-center mb-6 ${pacifico.className}`}>
                                    {t("follow")}
                                </h2>
                                <div className="flex space-x-6">
                                    <FollowUs/>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}