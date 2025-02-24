"use client";

import React from "react";
import {useStore} from "@/components/providers/store-provider";
import {Avatar} from "@heroui/avatar";
import {Link} from "@heroui/react";
import {Icon, IconProps} from "@iconify/react";

type SocialIconProps = Omit<IconProps, "icon">;


export function StoreHeader() {

    const { store } = useStore();


    const phone = {
        name: "Phone",
        href: `tel:${store?.phone}`,
        icon: (props: SocialIconProps) => <Icon {...props} icon="line-md:phone-call" strokeWidth={1.5} width={24}/>,
    };


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
                <div className="flex space-y-4 space-x-4 py-2 items-end">
                    {store?.instagram_url && (
                        <Link key={"Instagram"} isExternal className="text-default-500 h-6" href={store.instagram_url}>
                            <span className="sr-only">{store.instagram_url}</span>
                            <Icon  icon="line-md:instagram" strokeWidth={1.5} width={24} aria-hidden="true" className="w-6"/>
                        </Link>
                    )}
                    {store?.facebook_url && (
                        <Link key={"Facebook"} isExternal className="text-default-500 h-6" href={store.facebook_url}>
                            <span className="sr-only">{store.facebook_url}</span>
                            <Icon  icon="line-md:facebook" strokeWidth={1.5} width={24} aria-hidden="true" className="w-6"/>
                        </Link>
                    )}

                </div>
            </div>
            <div className="flex flex-col py-2 max-w-[300px] gap-y-4">
                {/*<p className={`text-large ${pacifico.className}`}>{store.ownerName}</p>*/}
                {store?.description &&
                    <p className="text-tiny whitespace-pre-wrap font-medium text-grayText">{store.description}</p>
                }
                {store?.phone &&
                    <Link key={"Phone"} isExternal className="text-default-500 gap-x-2 items-start" href={phone.href}>
                        <phone.icon aria-hidden="true"/>
                        {store.phone}
                        <span className="sr-only">{phone.name}</span>
                    </Link>
                }
            </div>
        </div>
    );
}
