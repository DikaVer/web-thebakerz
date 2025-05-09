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
        <div className="flex flex-col min-h-screen bg-gray-50">
            <main className="z-10 container mx-auto py-8 px-4 sm:px-6 lg:px-8 text-[#1F2937]">
                {/* Section 1: Nice to Meet You */}
                <section id={'nice-to-meet-you'} className="mb-16">
                    <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 relative shadow-xl rounded-lg overflow-hidden">
                        <div
                            className="flex items-center justify-center bg-gradient-to-br from-rose-100 via-white to-sky-100 rounded-none rounded-b-lg lg:rounded-none lg:rounded-l-lg">
                            <div
                                className="justify-center max-w-[620px] flex flex-col h-full text-center lg:text-left px-6 py-12 lg:px-12 mx-auto lg:mx-0">

                                <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 text-gray-800 ${pacifico.className}`}>
                                    {t("greetingTitle")}
                                </h1>

                                <div className="mb-6 text-md lg:text-lg font-light text-gray-700 leading-relaxed">
                                    <p>
                                        {t("greeting")}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="relative w-full h-[350px] sm:h-[450px] lg:h-auto">
                            <Image
                                src="/images/hero.webp"
                                alt="TheBakerz Team"
                                fill
                                className="object-cover" // Removed specific rounding for this image, parent has overflow:hidden
                                priority
                            />
                        </div>
                    </div>
                </section>

                {/* Section 2: Bake More, Manage Less */}
                <section id={'bake-more-manage-less'} className="mb-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 relative bg-white shadow-xl rounded-lg overflow-hidden">
                        <div className="relative overflow-hidden w-full h-[300px] sm:h-[400px] lg:h-auto order-first lg:order-none">
                             <Image
                                src="/images/HomeKitchen.svg"
                                alt="Baking Process Illustration"
                                layout="fill"
                                objectFit="contain"
                                className="p-4" // Added padding around the SVG
                                priority
                            />
                        </div>
                        <div className="flex items-center justify-center bg-gradient-to-br from-sky-100 via-white to-rose-100 rounded-none rounded-b-lg lg:rounded-none lg:rounded-r-lg">
                            <div className="max-w-[620px] flex flex-col h-full text-center lg:text-left px-6 py-12 lg:px-12 mx-auto lg:mx-0">
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-gray-800">
                                    {t("sloganTitle")}
                                </h2>
                                <div className="text-md lg:text-lg font-light text-gray-700 leading-relaxed">
                                    <p>
                                        {t("slogan")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Why TheBakerz */}
                <section id={'why-thebakerz'} className="mb-16">
                    <div className="bg-white p-6 sm:p-10 lg:p-16 rounded-lg shadow-xl text-center">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-gray-800">
                            {t("whyTitle")}
                        </h2>
                        <div className="max-w-3xl mx-auto text-md lg:text-lg font-light text-gray-700 leading-relaxed">
                            <p>
                                {t("why")}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 4: Connect With Us */}
                <section id={'connect-with-us'} className="py-12 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rounded-lg shadow-xl">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-8 ${pacifico.className}`}>
                            Connect with us! {/* Direct text, consider t() if needs translation */}
                        </h2>
                        <p className="text-white text-lg mb-10 max-w-2xl mx-auto">
                            Follow our journey, get the latest updates, and become part of TheBakerz community on our social channels.
                        </p>
                        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
                            {[
                                { href: "https://www.instagram.com/thebakerz.official", icon: "line-md:instagram", label: "Instagram" },
                                { href: "https://www.tiktok.com/@thebakerz.official", icon: "line-md:tiktok", label: "TikTok" },
                                { href: "https://www.youtube.com/@thebakerz.official", icon: "line-md:youtube", label: "YouTube" },
                                { href: "https://www.linkedin.com/company/thebakerz", icon: "line-md:linkedin", label: "LinkedIn" },
                                { href: "https://www.facebook.com/thebakerz.official", icon: "line-md:facebook", label: "Facebook" },
                                { href: "https://x.com/the_bakerz", icon: "line-md:twitter-x", label: "X (Twitter)" }
                            ].map((social) => (
                                <Link 
                                    key={social.label}
                                    href={social.href} 
                                    target="_blank" 
                                    aria-label={`Follow us on ${social.label}`}
                                    className="bg-white/30 backdrop-blur-sm text-white rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center hover:bg-white/50 transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                                >
                                    <Icon icon={social.icon} width="28" height="28" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}