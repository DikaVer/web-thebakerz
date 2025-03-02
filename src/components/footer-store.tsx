// import * as React from "react";
//
// export function Footer() {
//   return (
//       <footer className=" border-t bg-grayBg rounded-xl">
//           <div className="mx-4 desktop:mx-10 flex flex-col">
//               <div className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between py-24">
//                   <a
//                       className={"text-2xl font-bold text-ui-fg-subtle hover:text-ui-fg-base"}
//                       href={"/"}
//                   >
//                       TheBakerz
//                   </a>
//                   <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
//                       <div className="flex flex-col gap-y-2">
//                           <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
//                               <li>
//                                   <a
//                                       href="/join-thebakerz"
//                                       className="hover:text-ui-fg-base"
//                                   >
//                                       Work with Bakerz
//                                   </a>
//                               </li>
//                               <li>
//                                   <a
//                                       href="/support"
//                                       className="hover:text-ui-fg-base"
//                                   >
//                                       Get Help
//                                   </a>
//                               </li>
//                           </ul>
//                       </div>
//                       <div className="flex flex-col gap-y-2">
//                           <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
//                               <li>
//                                   <a
//                                       href="/policies/privacy-policy"
//                                   >
//                                       Privacy Policy
//                                   </a>
//                               </li>
//                               <li>
//                                   <a
//                                       href="/policies/terms-of-use"
//                                   >
//                                       Terms of Use
//                                   </a>
//                               </li>
//                           </ul>
//                       </div>
//                   </div>
//               </div>
//               <div className="flex w-full mb-16 justify-between text-ui-fg-muted">
//                   <p className="font-normal font-sans txt-medium txt-compact-small">
//                       © {new Date().getFullYear()} TheBakerz. All rights reserved.
//                   </p>
//               </div>
//           </div>
//       </footer>
//   )
// }

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


type SocialIconProps = Omit<IconProps, "icon">;

const footerNavigation = {
    overview: [
        {name: "TheBakerz", href: "/"},
        {name: "About TheBakerz", href: "/about-us"},
        {name: "Join TheBakerz", href: "/#join-thebakerz"},
        // {name: "Market Research", href: "#"},
    ],
    supportOptions: [
        {name: "Get Help", href: "/support"},
        // {name: "User Guides", href: "#"},
        // {name: "Tutorials", href: "#"},
        // {name: "Service Status", href: "#"},
    ],
    legal: [
        {name: "Privacy Policy", href: "/policies/privacy-policy"},
        {name: "Terms of use", href: "/policies/terms-of-use"},
        {name: "Refund Policy", href: "/policies/refund-policy"},
        // {name: "User Agreement", href: "#"},
    ],
    social: [
        {
            name: "LinkedIn",
            href: "https://www.linkedin.com/company/thebakerz",
            icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:linkedin" />,
        },
        {
            name: "Instagram",
            href: "https://www.instagram.com/thebakerz.official",
            icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:instagram" />,
        },
        {
            name: "Twitter",
            href: "https://x.com/the_bakerz",
            icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:twitter" />,
        }
    ],
};

export function FooterStore() {

    const { store } = useStore();
    const { theme } = useTheme();

    const [latitude, longitude] = [50.853356, 5.669382];

    const location = store?.location.route ? `${store.location.route}` : "Address Placeholder";
    const subLocation = store?.location.route ? `${store.location.city}, ${store.location.zipCode}, ${store.location.country}` : "Location Placeholder";

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

    const phone = {
        name: "Phone",
        href: `tel:${store?.phone}`,
        icon: (props: SocialIconProps) => <Icon {...props} icon="line-md:phone-call" strokeWidth={1.5} width={20} className={'text-default-600'}/>,
    };

    return (
        <footer className="flex w-full flex-col bg-gradient-card rounded-xl drop-shadow">
            <div className="py-8 md:py-16 container mx-auto">
                <div className="flex flex-col gap-y-6 items-start justify-between">
                    <div className="flex flex-col gap-y-6 gap-x-20 w-full md:flex-row md:items-start">
                        <div className={'grid gap-y-6 md:my-0 w-full md:w-[60%]'}>
                            <p className={'font-medium text-default-600'}>Contact Us</p>
                            <Link
                                href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                                className={'flex flex-row justify-between'}
                            >
                                <div className={'flex gap-x-2 items-center'}>
                                    <IconLocation size={20}
                                                  primaryColor={`${theme === 'light' ? '#5d5d5b' : '#d4d4d8'}`}
                                                  secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#d4d4d8'}`}
                                                  strokeWidth={2}
                                    />
                                    <div className={'flex flex-col gap-y-0'}>
                                        <p className={"text-sm  text-default-500"}>
                                            {location}
                                        </p>
                                        <p className={"text-xs font-light text-default-500"}>
                                            {subLocation}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                            <Link key={"Phone"} isExternal className="text-default-500 justify-between"
                                  href={phone.href}>
                                <div className={'flex gap-x-2'}>
                                    <phone.icon aria-hidden="true"/>
                                    <p className={'text-sm'}>
                                        {store.phone}
                                    </p>
                                    <span className="sr-only">{phone.name}</span>
                                </div>
                            </Link>
                        </div>
                        <div className={'grid justify-start gap-y-6 my-6 md:my-0 w-full md:w-[55%]'}>
                            <p className={'font-medium text-default-600'}>Working Hours</p>
                            {renderCalendarContent()}
                        </div>
                        <div className={`grid gap-8 grid-cols-2 md:grid-cols-1 w-full md:w-[45%]`}>
                            {/*<div>{renderList({title: "Services", items: footerNavigation.services})}</div>*/}
                            {renderList({title: "Legal", items: footerNavigation.legal})}
                            {renderList({title: "Support", items: footerNavigation.supportOptions})}
                        </div>
                    </div>
                    <Divider/>
                    <div className={'w-full flex justify-between items-center'}>
                        <p className="text-small text-grayText">
                            © {new Date().getFullYear()} TheBakerz. All rights reserved.
                        </p>
                        <a
                            className="flex items-end justify-end w-[80%] md:w-fit"
                            href="/"
                        >
                            <Image
                                src={`/images/TheBakerzLogo.svg`}
                                width={32}
                                height={32}
                            />
                            <span className={`text-2xl ml-2 ${pacifico.className}`}>TheBakerz</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
