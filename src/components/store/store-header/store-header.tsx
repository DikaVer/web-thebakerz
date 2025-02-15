"use client";

import React from "react";
import {useStore} from "@/components/providers/store-provider";
import {Avatar} from "@heroui/avatar";
import {Popover, PopoverContent, PopoverTrigger, Spacer, Tooltip} from "@heroui/react";
import {IconCopy, IconLocation, IconPhone} from "@/components/ui/icons";
import {useTheme} from "next-themes";
import {CopyText} from "@/components/ui/copy-text";
import showSuccessMessage from "@/components/toast/toast-succes";


export function StoreHeader() {

    const { store } = useStore();
    const { theme } = useTheme();

    const location = store?.location.route ? `${store.location.route}, ${store.location.city}, ${store.location.zipCode}, ${store.location.country}` : "Location Placeholder";


    return (
        <div className={'flex flex-row w-full items-center max-w-[440px] md:w-2/3'}>
            <div className={'w-[140px]'}>
                <Popover placement="right">
                    <PopoverTrigger>
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
                    </PopoverTrigger>
                    <PopoverContent>
                        <div className="px-1 py-2">
                            <div className="text-small font-bold">{store.ownerName}</div>
                            <div className="text-tiny">{store.description}</div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            <Spacer x={8}/>
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
                    <p className={"md:text-lg truncate max-w-[120px] md:max-w-[300px] text-grayText"}>
                        {location}
                    </p>
                </CopyText>
                <Spacer y={4}/>
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
                    <p className={"md:text-lg truncate max-w-[120px] md:max-w-[250px] text-grayText"}>
                        {store?.phone ? store.phone : 'Phone Number Placeholder'}
                    </p>
                </CopyText>
            </div>
        </div>
    );
}
