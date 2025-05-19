"use client";

import Image from "next/image";
import ScrollingBanner from "../ui/scrolling-banner";
import { useTranslations } from "next-intl";

const partners = [
  {
    name: "Brightlands",
    logo: "/partner/brightlands-screen.svg",
    alt: "Brightlands logo"
  },
  {
    name: "Maastricht University",
    logo: "/partner/Maastricht_University_logo.svg",
    alt: "Maastricht University logo"
  },
  {
    name: "Cloud",
    logo: "/partner/Google_for_Startups_logo.svg",
    alt: "Google for Startups logo"
  },
  {
    name: "Microsoft",
    logo: "/partner/Microsoft-for-Startups.png",
    alt: "Microsoft logo"
  }
];

export default function Partners() {
    const t = useTranslations("app/(landing)/components/partners");
  return (
    <section className="py-16 w-full">
      <div className="container mx-auto mb-8">
        <h2 className="text-3xl font-bold text-center mb-6">{t("title")}</h2>
        <p className="text-center text-default-400 max-w-2xl mx-auto">
          {t("description")}
        </p>
      </div>
      
      <ScrollingBanner 
        className="w-full dark:bg-default-900" 
        gap="4rem"
        duration={30}
      >
        {partners.map((partner) => (
          <div key={partner.name} className="flex items-center justify-center h-24 px-8">
            <Image 
              src={partner.logo} 
              alt={partner.alt}
              width={160}
              height={80}
              className="object-contain h-full max-w-[160px]"
            />
          </div>
        ))}
        {/* Duplicate partners for continuous loop effect */}
        {partners.map((partner) => (
          <div key={`${partner.name}-duplicate`} className="flex items-center justify-center h-24 px-8">
            <Image 
              src={partner.logo} 
              alt={partner.alt}
              width={160}
              height={80}
              className="object-contain h-full max-w-[160px]"
            />
          </div>
        ))}
      </ScrollingBanner>
    </section>
  );
} 