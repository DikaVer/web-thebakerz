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
import {Image, Link} from "@heroui/react";
import {Icon} from "@iconify/react";
import {pacifico} from "@/components/fonts";


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

export function FooterSimple() {

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
                <div className="flex flex-col sm:flex-row gap-y-6 xsmall:flex-row items-start justify-between">
                    <div className="space-y-8 md:pr-8">
                        <a
                            className="flex items-end justify-start"
                        >
                            <Image
                                src={`/images/TheBakerzLogo.svg`}
                                width={42}
                                height={42}
                            />
                            <span className={`text-3xl ml-2 ${pacifico.className}`}>TheBakerz</span>
                        </a>
                        <p className="text-small text-grayText">
                            © {new Date().getFullYear()} Powered by TheBakerz. All rights reserved.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-8 ">
                        {renderList({title: "Support", items: footerNavigation.supportOptions})}
                            {/*<div>{renderList({title: "Services", items: footerNavigation.services})}</div>*/}
                        {renderList({title: "Legal", items: footerNavigation.legal})}

                    </div>
                </div>
            </div>
        </footer>
    );
}
