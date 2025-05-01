import {pacifico} from "@/components/fonts";
import Image from 'next/image';
import React from "react";
import type {Metadata} from "next";
import {getLocalizedMetadata, metadataTranslations} from "@/components/metadata";
import {getLocale, getTranslations} from "next-intl/server";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";

// Define page-specific metadata translations
const pageMetadataTranslations = {
    en: {
        title: "About Us | The Team Behind Your Bakery Success",
        description: "Meet the passionate team behind TheBakerz - dedicated to helping artisanal bakers grow their businesses with innovative tools and personalized support.",
        keywords: "TheBakerz team, about TheBakerz, bakery platform developers, artisanal bakery support, bakery tech innovators, baker community, bakery business experts, bakery management team",
        ogTitle: "About TheBakerz | Meet the Team",
        ogDescription: "Discover the story and the people behind TheBakerz, the platform empowering artisanal bakers.",
        twitterTitle: "About Us | TheBakerz Team",
        twitterDescription: "Meet the passionate team dedicated to helping bakers succeed. #TheBakerz #BakeryTech #AboutUs"
    },
    nl: {
        title: "Over Ons | Het Team Achter Jouw Bakkerijsucces",
        description: "Maak kennis met het gepassioneerde team achter TheBakerz - toegewijd aan het helpen van ambachtelijke bakkers om hun bedrijf te laten groeien met innovatieve tools en persoonlijke ondersteuning.",
        keywords: "TheBakerz team, over TheBakerz, ontwikkelaars bakkerijplatform, ondersteuning ambachtelijke bakkerij, bakkerij tech innovators, bakkersgemeenschap, experts bakkerijbedrijf, bakkerij management team",
        ogTitle: "Over TheBakerz | Ontmoet het Team",
        ogDescription: "Ontdek het verhaal en de mensen achter TheBakerz, het platform dat ambachtelijke bakkers ondersteunt.",
        twitterTitle: "Over Ons | TheBakerz Team",
        twitterDescription: "Maak kennis met het gepassioneerde team dat zich inzet om bakkers te helpen slagen. #TheBakerz #BakeryTech #OverOns"
    }
};

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const baseMetadata = getLocalizedMetadata(locale); // Fetch base metadata

    let localeKey: 'en' | 'nl' = 'en';
    if (locale === 'nl-NL' || locale === 'nl') {
        localeKey = 'nl';
    }

    const pageSpecifics = pageMetadataTranslations[localeKey];
    const aboutUrl = `https://www.thebakerz.com/about-us`;

    // Merge keywords
    const baseKeywords = metadataTranslations[localeKey].keywords.split(', ');
    const pageKeywords = pageSpecifics.keywords.split(', ');
    const mergedKeywords = Array.from(new Set([...baseKeywords, ...pageKeywords]));

    return {
        ...baseMetadata,
        title: pageSpecifics.title,
        description: pageSpecifics.description,
        keywords: mergedKeywords,
        alternates: {
            ...baseMetadata.alternates,
            canonical: aboutUrl,
            languages: {
                'en-US': `https://www.thebakerz.com/about-us`,
                'nl-NL': `https://www.thebakerz.com/about-us`,
                'x-default': `https://www.thebakerz.com/about-us`,
            }
        },
        openGraph: {
            ...baseMetadata.openGraph,
            title: pageSpecifics.ogTitle,
            description: pageSpecifics.ogDescription,
            url: aboutUrl,
        },
        twitter: {
            ...baseMetadata.twitter,
            title: pageSpecifics.twitterTitle,
            description: pageSpecifics.twitterDescription,
        },
    };
}

export default async function Page() {
    const t = await getTranslations("app/(main)/about-us/page");

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
                                    {t("greetingTitle")}
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
                                    {t("sloganTitle")}
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
                                    {t("whyTitle")}
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

                                <h2 className={`text-4xl lg:text-6xl font-bold text-center mb-6`}>
                                    Connect with us on our social channels
                                </h2>
                                {/* Social Links */}
                                <div className="flex flex-wrap justify-center gap-5">
                                    <Link href="https://www.instagram.com/thebakerz.official" target="_blank" className="bg-default-200 rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors">
                                    <Icon icon="line-md:instagram" width="24" height="24" />
                                    </Link>
                                    <Link href="https://www.tiktok.com/@thebakerz.official" target="_blank" className="bg-default-200 rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors">
                                    <Icon icon="line-md:tiktok" width="24" height="24" />
                                    </Link>
                                    <Link href="https://www.youtube.com/@thebakerz.official" target="_blank" className="bg-default-200 rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors">
                                    <Icon icon="line-md:youtube" width="24" height="24" />
                                    </Link>
                                    <Link href="https://www.linkedin.com/company/thebakerz" target="_blank" className="bg-default-200 rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors">
                                    <Icon icon="line-md:linkedin" width="24" height="24" />
                                    </Link>
                                    <Link href="https://www.facebook.com/thebakerz.official" target="_blank" className="bg-default-200 rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors">
                                    <Icon icon="line-md:facebook" width="24" height="24" />
                                    </Link>
                                    <Link href="https://x.com/the_bakerz" target="_blank" className="bg-default-200 rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors">
                                    <Icon icon="line-md:twitter-x" width="24" height="24" />
                                    </Link>
                                </div>    
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}