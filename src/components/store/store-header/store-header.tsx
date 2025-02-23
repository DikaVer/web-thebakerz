"use client";

import React from "react";
import {useStore} from "@/components/providers/store-provider";
import {Avatar} from "@heroui/avatar";
import {Link, Popover, PopoverContent, PopoverTrigger, Spacer, Tooltip} from "@heroui/react";
import {IconCopy, IconLocation, IconPhone} from "@/components/ui/icons";
import {useTheme} from "next-themes";
import {CopyText} from "@/components/ui/copy-text";
import showSuccessMessage from "@/components/toast/toast-succes";
import {pacifico} from "@/components/fonts";
import {Icon, IconProps} from "@iconify/react";

type SocialIconProps = Omit<IconProps, "icon">;

const storeHeader = {
    social: [
        {
            name: "LinkedIn",
            href: "https://www.linkedin.com/company/thebakerz",
            icon: (props: SocialIconProps) => <Icon {...props} icon="line-md:linkedin" strokeWidth={1.5} width={24}/>,
        },
        {
            name: "Instagram",
            href: "https://www.instagram.com/thebakerz.official",
            icon: (props: SocialIconProps) => <Icon {...props} icon="line-md:instagram" strokeWidth={1.5} width={24}/>,
        },
        {
            name: "Twitter",
            href: "https://x.com/the_bakerz",
            icon: (props: SocialIconProps) => <Icon {...props} icon="line-md:twitter-x" strokeWidth={1.5} width={24}/>,
        },
        {
            name: "Phone",
            href: "tel:+31645422552",
            icon: (props: SocialIconProps) => <Icon {...props} icon="line-md:phone-call" strokeWidth={1.5} width={24}/>,
        },
    ],
};

export function StoreHeader() {

    const { store } = useStore();

    const text = `🍰 Cake&Desserts is a charming boutique bakery nestled in the heart of Maastricht, Netherlands.
    \n🎂 Blending traditional European baking techniques with modern flavor twists, we create unforgettable experiences.`;

    return (
        <div className={'flex flex-row gap-x-8 w-full'}>
            <div className={'w-[140px]'}>
                    <Avatar
                        isBordered
                        showFallback={!!store.picture}
                        className={`w-[140px] h-[140px] text-large ml-1`}
                        name={store.ownerName}
                        src={store.picture}
                        color={'primary'}
                        classNames={{
                            base: `bg-default text-text shadow-lg`,
                        }}
                    />
                <div className="flex space-y-4 py-2 justify-between items-end">
                    {storeHeader.social.map((item) => (
                        <Link key={item.name} isExternal className="text-default-400 h-6" href={item.href}>
                            <span className="sr-only">{item.name}</span>
                            <item.icon aria-hidden="true" className="w-6" />
                        </Link>
                    ))}
                </div>
            </div>
            <div className="flex flex-col py-2 max-w-[300px] gap-y-4">
                <p className={`text-large ${pacifico.className}`}>{store.ownerName}</p>
                <p className="text-tiny whitespace-pre-wrap font-medium text-grayText line-clamp-8 h-full">{text}</p>
            </div>
        </div>
    );
}
