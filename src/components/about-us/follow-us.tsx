"use client";

import {Image, Link} from "@heroui/react";
import {Icon, IconProps} from "@iconify/react";
import React from "react";

export const FollowUs = () => {
    return (
        <div className="flex space-x-16">
            {social.map((item) => (
                <Link key={item.name} isExternal className="text-default-400"
                      href={item.href}>
                    <span className="sr-only">{item.name}</span>
                    <item.icon aria-hidden="true" className="w-16 h-16"/>
                </Link>
            ))}
        </div>
    );
}

type SocialIconProps = Omit<IconProps, "icon">;

const social = [
    {
        name: "LinkedIn",
        href: "https://www.linkedin.com/company/thebakerz",
        icon: (props: SocialIconProps) => <Icon {...props} icon="logos:linkedin-icon"/>,
    },
    {
        name: "Instagram",
        href: "https://www.instagram.com/thebakerz.official",
        icon: () =>
            <div className={`w-16 h-16 mt-10`}>
                <Image src="/brandIcons/instagram.svg" width={64} className={'flex-0 flex-grow-0'}/>
            </div>,
    },
    {
        name: "Twitter",
        href: "https://x.com/the_bakerz",
        icon: (props: SocialIconProps) => <Icon {...props} icon="logos:twitter" />,
    }
];