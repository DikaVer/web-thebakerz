"use client";

import type {IconProps} from "@iconify/react";

import React from "react";
import {Divider, Image, Link} from "@heroui/react";
import {Icon} from "@iconify/react";
import {pacifico} from "@/components/fonts";
import {useStore} from "@/components/providers/store-provider";
import {renderCalendarContent} from "@/components/store/store-header/subheader/working-hours";
import {IconLocation} from "@/components/ui/icons";
import {useTheme} from "next-themes";
import {useTranslations} from "next-intl";

type SocialIconProps = Omit<IconProps, "icon">;

export function FooterStore() {
    const t = useTranslations("app/(components)/footer-store");

    const { store } = useStore();
    const { theme } = useTheme();

    const [latitude, longitude] = [50.853356, 5.669382];

    const location = store?.location.route ? `${store.location.route}` : t("addressPlaceholder");
    const subLocation = store?.location.route ? `${store.location.city}, ${store.location.zipCode}, ${store.location.country}` : t("locationPlaceholder");

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
                name: t("linkedIn"),
                href: "https://www.linkedin.com/company/thebakerz",
                icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:linkedin" />,
            },
            {
                name: t("instagram"),
                href: "https://www.instagram.com/thebakerz.official",
                icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:instagram" />,
            },
            {
                name: t("twitter"),
                href: "https://x.com/the_bakerz",
                icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:twitter" />,
            }
        ],
    };

    const renderList = React.useCallback(
        ({title, items}: {title: string; items: {name: string; href: string}[]}) => (
            <div>
                <h3 className="text-small md:text-medium font-semibold text-default-600">{title}</h3>
                <ul className="mt-4 space-y-3">
                    {items.map((item) => (
                        <li key={item.name}>
                            <Link className="text-grayText hover:text-default-500 transition-colors" href={item.href} size="sm">
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        ),
        [],
    );

    const phone = {
        name: t("phone"),
        href: `tel:${store?.phone}`,
        icon: (props: SocialIconProps) => <Icon {...props} icon="line-md:phone-call" strokeWidth={1.5} width={20} className={'text-default-600'}/>,
    };

    return (
        <footer className="flex w-full flex-col bg-gradient-card rounded-xl drop-shadow">
            <div className="py-8 md:py-12 container mx-auto">
                <div className="flex flex-col gap-y-8 items-start justify-between">
                    <div className="flex flex-col gap-y-8 gap-x-12 w-full md:flex-row md:items-start">
                        <div className="grid gap-y-4 md:my-0 w-full md:w-[40%]">
                            <h3 className="md:small text-medium font-semibold text-default-600">{t("contactUs")}</h3>
                            <Link
                                href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                                className="flex flex-row hover:text-default-500 transition-colors"
                            >
                                <div className="flex gap-x-2 items-center">
                                    <IconLocation size={20}
                                                  primaryColor={`${theme === 'light' ? '#5d5d5b' : '#d4d4d8'}`}
                                                  secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#d4d4d8'}`}
                                                  strokeWidth={2}
                                    />
                                    <div className="flex flex-col gap-y-0">
                                        <p className="text-sm text-default-500">
                                            {location}
                                        </p>
                                        <p className="text-xs font-light text-default-500">
                                            {subLocation}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                            <Link key="Phone" isExternal className="text-default-500 hover:text-default-400 transition-colors flex items-center"
                                  href={phone.href}>
                                <div className="flex gap-x-2 items-center">
                                    <phone.icon aria-hidden="true"/>
                                    <p className="text-sm">
                                        {store.phone}
                                    </p>
                                    <span className="sr-only">{phone.name}</span>
                                </div>
                            </Link>
                        </div>
                        <div className="flex justify-start gap-y-4 my-0 w-full md:w-[30%]">
                            <div className="w-full mr-4">
                                <h3 className="md:small text-medium font-semibold text-default-600">{t("Opening Hours")}</h3>
                                <div className="mt-4">
                                    {renderCalendarContent()}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-8 w-full md:w-[30%]">
                            <div>
                                {renderList({title: t("legal"), items: footerNavigation.legal})}
                            </div>
                            <div>
                                {renderList({title: t("support"), items: footerNavigation.supportOptions})}
                            </div>
                        </div>
                    </div>
                    <Divider/>
                    <div className="w-full flex flex-col md:flex-row justify-between items-center gap-y-4">
                        <div className="flex items-center gap-x-4">
                            {footerNavigation.social.map((item) => (
                                <Link key={item.name} href={item.href} isExternal className="text-default-500 hover:text-default-400 transition-colors">
                                    <span className="sr-only">{item.name}</span>
                                    <item.icon aria-hidden="true" width={20} height={20} />
                                </Link>
                            ))}
                        </div>
                        <p className="text-small text-grayText order-3 md:order-2">
                            © {new Date().getFullYear()} {t("copyright")}
                        </p>
                        <a
                            className="flex items-center justify-end order-1 md:order-3"
                            href="/"
                        >
                            <Image
                                src="/images/TheBakerzLogo.svg"
                                width={32}
                                height={32}
                                alt={t("brandName") + " Logo"}
                            />
                            <span className={`text-2xl ml-2 ${pacifico.className}`}>{t("brandName")}</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}