"use client";

import type {IconProps} from "@iconify/react";

import React from "react";
import {Divider, Image, Link} from "@heroui/react";
import {Icon} from "@iconify/react";
import {pacifico} from "@/components/fonts";
import {useTranslations} from "next-intl";

type SocialIconProps = Omit<IconProps, "icon">;

export function FooterSimple() {
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
            <div className="py-16 container mx-auto">
                <div className="flex flex-col gap-y-6 items-start justify-between">
                    <div>
                        <div className={`grid gap-8 grid-cols-2`}>
                            {renderList({title: t("Support"), items: footerNavigation.supportOptions})}
                            {renderList({title: t("Legal"), items: footerNavigation.legal})}
                        </div>
                    </div>
                    <Divider/>
                    <div className={'w-full flex justify-between items-center'}>
                        <p className="text-small text-grayText">
                            © {new Date().getFullYear()} {t("Copyright")}
                        </p>
                        <a
                            className="flex items-end justify-end w-[80%]"
                            href="/"
                        >
                            <Image
                                src={`/images/TheBakerzLogo.svg`}
                                width={32}
                                height={32}
                            />
                            <span className={`text-2xl ml-2 ${pacifico.className}`}>{t("BrandName")}</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}