"use client";

import type {IconProps} from "@iconify/react";

import React from "react";
import {Image, Link} from "@heroui/react";
import {Icon} from "@iconify/react";
import {pacifico} from "@/components/fonts";
import {useTranslations} from "next-intl";

type SocialIconProps = Omit<IconProps, "icon">;

const Footer = () => {
    const t = useTranslations("app/(components)/footer");

    const footerNavigation = {
        overview: [
            {name: t("search"), href: "/"},
            {name: t("aboutTheBakerz"), href: "/about-us"},
            {name: t("joinTheBakerz"), href: "/become-partner#join-thebakerz"},
        ],
        supportOptions: [
            {name: t("getHelp"), href: "/support"},
        ],
        legal: [
            {name: t("privacyPolicy"), href: "/policies/privacy-policy"},
            {name: t("termsOfUse"), href: "/policies/terms-of-use"},
            {name: t("refundPolicy"), href: "/policies/refund-policy"},
        ],
        social: [
            {
                name: "Instagram",
                href: "https://www.instagram.com/thebakerz.official",
                icon: (props: SocialIconProps) => <Icon {...props} icon="line-md:instagram" />,
            },
            {
                name: "TikTok",
                href: "https://www.tiktok.com/@thebakerz.official",
                icon: (props: SocialIconProps) => <Icon {...props} icon="line-md:tiktok" />,
            },
            {
                name: "Youtube",
                href: "https://www.youtube.com/@the_bakerz", 
                icon: (props: SocialIconProps) => <Icon {...props} icon="line-md:youtube" />,
            },
            {
                name: "LinkedIn",
                href: "https://www.linkedin.com/company/thebakerz",
                icon: (props: SocialIconProps) => <Icon {...props} icon="line-md:linkedin" />,
            },
            {
                name: "Facebook",
                href: "https://www.facebook.com/thebakerz.official",
                icon: (props: SocialIconProps) => <Icon {...props} icon="line-md:facebook" />,
            },
            {
                name: "Twitter",
                href: "https://x.com/the_bakerz",
                icon: (props: SocialIconProps) => <Icon {...props} icon="line-md:twitter-x" />,
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
        <footer className="flex w-full flex-col bg-gradient-card drop-shadow">
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
                            <span className={`text-3xl ml-2 ${pacifico.className}`}>{t("brandName")}</span>
                        </a>
                        <p className="text-small text-grayText">
                            © {new Date().getFullYear()} {t("copyright")}
                        </p>
                        <div className="flex space-x-6">
                            {footerNavigation.social.map((item) => (
                                <Link key={item.name} isExternal className="text-default-400 h-6" href={item.href}>
                                    <span className="sr-only">{item.name}</span>
                                    <item.icon aria-hidden="true" className="w-6 h-6" />
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>{renderList({title: t("navigation"), items: footerNavigation.overview})}</div>
                            <div className="mt-10 md:mt-0">
                                {renderList({title: t("support"), items: footerNavigation.supportOptions})}
                            </div>
                        </div>
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div className="mt-10 md:mt-0">
                                {renderList({title: t("legal"), items: footerNavigation.legal})}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export { Footer };