"use client";

import type {IconProps} from "@iconify/react";

import React from "react";
import {Image, Link} from "@heroui/react";
import {Icon} from "@iconify/react";
import {pacifico} from "@/components/fonts";
import {useTranslations} from "next-intl";

type SocialIconProps = Omit<IconProps, "icon">;

const Footer = () => {
    const t = useTranslations("TheBakerz");

    const footerNavigation = {
        overview: [
            {name: t("BrandName"), href: "/"},
            {name: t("AboutTheBakerz"), href: "/about-us"},
            {name: t("JoinTheBakerz"), href: "/#join-thebakerz"},
        ],
        supportOptions: [
            {name: t("GetHelp"), href: "/support"},
        ],
        legal: [
            {name: t("PrivacyPolicy"), href: "/policies/privacy-policy"},
            {name: t("TermsOfUse"), href: "/policies/terms-of-use"},
            {name: t("RefundPolicy"), href: "/policies/refund-policy"},
        ],
        social: [
            {
                name: t("LinkedIn"),
                href: "https://www.linkedin.com/company/thebakerz",
                icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:linkedin" />,
            },
            {
                name: t("Instagram"),
                href: "https://www.instagram.com/thebakerz.official",
                icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:instagram" />,
            },
            {
                name: t("Twitter"),
                href: "https://x.com/the_bakerz",
                icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:twitter" />,
            }
        ],
    };

    const renderList = React.useCallback(
        ({title, items}: {title: string; items: {name: string; href: string}[]}) => (
            <div>
                <h3 className="text-small font-semibold text-default-600">{title}</h3>
                <ul className="mt-6 space-y-4">
                    {items.map((item) => (
                        <li key={item.name}>
                            <Link className="text-grayText" href={item.href} size="sm">
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        ),
        [],
    );

    return (
        <footer className="flex w-full flex-col bg-gradient-card rounded-xl drop-shadow">
            <div className=" px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    <div className="space-y-8 md:pr-8">
                        <a
                            className="flex items-end justify-start"
                            href="/"
                        >
                            <Image
                                src={`/images/TheBakerzLogo.svg`}
                                width={42}
                                height={42}
                            />
                            <span className={`text-3xl ml-2 ${pacifico.className}`}>{t("BrandName")}</span>
                        </a>
                        <p className="text-small text-grayText">
                            © {new Date().getFullYear()} {t("Copyright")}
                        </p>
                        <div className="flex space-x-6">
                            {footerNavigation.social.map((item) => (
                                <Link key={item.name} isExternal className="text-default-400 h-6" href={item.href}>
                                    <span className="sr-only">{item.name}</span>
                                    <item.icon aria-hidden="true" className="w-6" />
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>{renderList({title: t("Navigation"), items: footerNavigation.overview})}</div>
                            <div className="mt-10 md:mt-0">
                                {renderList({title: t("Support"), items: footerNavigation.supportOptions})}
                            </div>
                        </div>
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div className="mt-10 md:mt-0">
                                {renderList({title: t("Legal"), items: footerNavigation.legal})}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export { Footer };