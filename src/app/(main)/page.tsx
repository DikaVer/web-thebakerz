"use client";

import React from "react";
import Image from "next/image";
import {
    IconHeart,
    IconMessage,
    IconOrder,
    IconStore,
    IconStar,
    IconSupport,
} from "@/components/ui/icons";
import { FirstView } from "@/components/landing/first-view";
import Skeleton from "react-loading-skeleton";
import {pacifico} from "@/components/fonts";
import {useInView} from "@/lib/hooks/useInView";

export default function Page() {
    return (
            <div className="flex flex-col min-h-screen relative z-10">
                <div className="flex-grow container mx-auto">
                    <FirstView/>

                    {/* Why Choose Section */}
                    <WhyChooseSection/>
                </div>

                {/* Succeed Footer */}
                <Footer/>
            </div>
    );
}

// WhyChooseSection Component
const WhyChooseSection = () => {
    const [whyChooseRef, whyChooseInView] = useInView<HTMLHeadingElement>({ threshold: 0 });

    return (
        <section
            id="why-choose"
            className="w-full px-4 sm:px-6 lg:px-8 py-12 bg-white rounded-lg"
            aria-labelledby="why-choose-heading"
        >
            <h2
                ref={whyChooseRef}
                id="why-choose-heading"
                className={`text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-10 
                            opacity-0 transform translate-y-10 
                            ${whyChooseInView ? 'animate-fadeInUpDelay1' : ''}`}
            >
                Why Choose TheBakerz?
            </h2>
            <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-8`}
            >
                {/* Online Store */}
                <FeatureCard
                    icon={<IconStore viewBox="0 0 576 512" className="w-12 h-12" color="primary" aria-hidden="true" />}
                    title="Online Store"
                    description="We create your own online store to showcase your delicious creations and accept orders seamlessly."
                />

                {/* Order Management */}
                <FeatureCard
                    icon={<IconOrder viewBox="0 0 384 512" className="w-12 h-12" color="primary" aria-hidden="true" />}
                    title="Order Management"
                    description="Easily track and manage all your orders in one place, reducing the risk of errors and missed orders."
                />

                {/* All Chats in One Place */}
                <FeatureCard
                    icon={<IconMessage viewBox="0 0 24 24" className="w-12 h-12" color="primary" aria-hidden="true" />}
                    title="All Chats in One Place"
                    description="Connect customer chats from Instagram and WhatsApp to orders in one place for easy communication."
                />

                {/* Customer Support */}
                <FeatureCard
                    icon={<IconSupport viewBox="0 0 24 24" className="w-12 h-12" color="primary" aria-hidden="true" />}
                    title="Flexible Support"
                    description="Our dedicated team is here to help during our available hours, ensuring your queries are addressed promptly."
                />
            </div>
        </section>
    );
};

// FeatureCard Component
interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
    const [featureCardRef, featureCardInView] = useInView<HTMLDivElement>({ threshold: 0 });

    return (
        <article
            ref={featureCardRef}
            className={`flex flex-col items-center text-center p-6 border-2 border-grayBg rounded-lg shadow-sm
                opacity-0 transform translate-y-10 
                ${featureCardInView ? 'animate-fadeInUpDelay2' : ''}`}
        >
            <div className="bg-secondary p-4 rounded-full mb-6">
                {icon}
            </div>
            <h3 className="flex text-xl sm:text-2xl lg:h-12 lg:items-center lg:justify-center font-semibold text-gray-800 mb-4">{title}</h3>
            <p className="text-gray-600 text-lg sm:text-xl">{description}</p>
        </article>
    )
};

// Footer Component
const Footer = () => {
    const [footerRef, footerInView] = useInView<HTMLDivElement>({ threshold: 0 });

    return (
        <div
            ref={footerRef}
            className={`relative mt-16 lg:px-16 bg-secondary w-full flex justify-between items-center rounded-lg
            ${footerInView ? 'animate-fadeInUp' : ''}
            `}
        >
        <div className={"flex flex-row items-end"}>
            <IconHeart viewBox={"0 0 512 512"} className={"w-0 h-0 heart-display:w-32 heart-display:h-32"}
                       color={"heart"}/>
            <IconHeart viewBox={"0 0 512 512"} className={"w-0 h-0 heart-display:w-10 heart-display:h-10"}
                       color={"heart"}/>
        </div>
        <div className="relative w-36 proportional-girl-mb girl-md:mb-28">
            <Image
                src="/images/Mickey.svg"
                alt="TheBakerz - Mickey"
                className="absolute z-50"
                width={192}
                height={279}
                quality={100}
            />
        </div>
        <span className={`text-3xl text-primary text-center ${pacifico.className}`}>We want you to succeed</span>
        <div className="relative w-36 proportional-girl-mb girl-md:mb-32">
            <Image
                src="/images/Wiki.svg"
                alt="TheBakerz - Wiki"
                className="absolute z-50 pb-20"
                width={185}
                height={278}
                quality={100}
            />
        </div>
        <div className={"flex flex-row items-end"}>
            <IconHeart viewBox={"0 0 512 512"} className={"w-0 h-0 heart-display:w-10 heart-display:h-10"}
                       color={"heart"}/>
            <IconHeart viewBox={"0 0 512 512"} className={"w-0 h-0 heart-display:w-32 heart-display:h-32"}
                       color={"heart"}/>
        </div>
        </div>
    );
};
