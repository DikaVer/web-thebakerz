"use client";

import React from "react";
import {useStore} from "@/components/providers/store-provider";
import {Avatar} from "@heroui/avatar";
import {useIsMobile} from "@/lib/hooks/use-mobile";
import {Button,  Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Spacer} from "@heroui/react";
import {IconCopy, IconDots, IconLocation, IconPhone} from "@/components/ui/icons";
import {useTheme} from "next-themes";
import {CopyText} from "@/components/table/copy-text";

import {useSession} from "@/components/providers/session-provider";
import showSuccessMessage from "@/components/toast/toast-succes";
import {StoreSubHeader} from "@/components/store/store-header/store-subheader";


export function StoreHeader() {

    const { session} = useSession();
    const { user } = session

    const { store } = useStore();
    const { theme } = useTheme();

    const location = store?.location.route ? `${store.location.route}, ${store.location.city}, ${store.location.zipCode}, ${store.location.country}` : "Location Placeholder";



    return (
        <div className={'flex flex-col w-full items-center'}>
            <Spacer y={8}/>
            <div className={'flex flex-row items-center'}>

                <>
                    <Avatar
                        isBordered
                        showFallback={!!store.picture}
                        className={`w-[140px] h-[140px] text-large`}
                        name={store.ownerName}
                        src={store.picture}
                        color={'primary'}
                        classNames={{
                            base: `bg-default text-text shadow-lg`,
                        }}

                    />
                </>
                <Spacer x={4}/>
                <div>
                    <CopyText
                        copyText={location}
                        className={"max-w-[300px] md:max-w-[400px] text-medium md:text-large"}
                        textNotify={"Location Copied!"}
                        startContent={<IconLocation size={24}
                                                    primaryColor={`${theme === 'light' ? '#730c70' : '#a3a3a3'}`}
                                                    secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#faf4d1'}`}
                        />}
                        endContent={<IconCopy size={20}
                                              primaryColor={`${theme === 'light' ? '#730c70' : '#faf4d1'}`}
                                              secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#a3a3a3'}`}
                        />}
                    >
                        <p className={"md:text-lg truncate max-w-[150px] md:max-w-[250px] text-grayText"}>
                            {location}
                        </p>
                    </CopyText>
                    <Spacer y={2}/>
                    <CopyText
                        copyText={store?.phone ? store.phone : 'Phone Number Placeholder'}
                        className={"max-w-[300px] md:max-w-[400px] md:text-lg"}
                        textNotify={"Phone Number Copied!"}
                        startContent={<IconPhone size={24}
                                                 primaryColor={`${theme === 'light' ? '#730c70' : '#a3a3a3'}`}
                                                 secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#faf4d1'}`}
                        />}
                        endContent={<IconCopy size={20}
                                              primaryColor={`${theme === 'light' ? '#730c70' : '#faf4d1'}`}
                                              secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#a3a3a3'}`}
                        />}
                    >
                        <p className={"md:text-lg truncate max-w-[150px] md:max-w-[250px] text-grayText"}>
                            {store?.phone ? store.phone : 'Phone Number Placeholder'}
                        </p>
                    </CopyText>
                </div>
            </div>
        </div>
    );
}
