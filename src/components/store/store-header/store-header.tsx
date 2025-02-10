"use client";

import React, { useState } from "react";
import {useStore} from "@/components/providers/store-provider";
import {Avatar} from "@heroui/avatar";
import {useIsMobile} from "@/lib/hooks/use-mobile";
import {Button, cn, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Link, Spacer} from "@heroui/react";
import {IconCopy, IconDots, IconLocation, IconPhone} from "@/components/ui/icons";
import {useTheme} from "next-themes";
import {pacifico} from "@/components/fonts";
import {CopyText} from "@/components/table/copy-text";
import {Icon} from "@iconify/react";
import {useSession} from "@/components/providers/session-provider";
import showSuccessMessage from "@/components/toast/toast-succes";


export function StoreHeader() {

    const { session} = useSession();
    const { user } = session

    const { store } = useStore();
    const isMobile = useIsMobile();
    const { theme } = useTheme();

    const location = store?.location.route ? `${store.location.route}, ${store.location.city}, ${store.location.zipCode}, ${store.location.country}` : "Location Placeholder";



    return (
        <div className={'flex flex-col w-full'}>
            <Spacer y={12}/>
            <div className={'flex w-full max-w-xl justify-end'}>
                <Dropdown
                    backdrop="blur">
                    <DropdownTrigger>
                        <Button
                            isIconOnly
                            color={'default'}
                            variant="light"
                            className={'py-0 my-0 h-2 mr-4 stroke-2 hover:bg-primary'}
                        >
                            <IconDots
                                size={36}
                                primaryColor={`${theme === 'light' ? '#5d5d5b' : '#faf4d1'}`}
                            />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Static Actions" variant="faded">
                        {user?.role === 'bakerz' ? (
                                <>
                                    <DropdownItem
                                        key="new"
                                        startContent={<IconCopy size={24}/>}
                                    >
                                        Edit Store
                                    </DropdownItem>
                                    <DropdownItem key="copy">Copy link</DropdownItem>
                                    <DropdownItem key="edit">Edit file</DropdownItem>
                                    <DropdownItem key="delete" className="text-danger" color="danger">
                                        Delete file
                                    </DropdownItem>
                                </>
                            ) : (
                            <>
                                <DropdownItem
                                    key="new"
                                    endContent={<IconCopy
                                        size={24}
                                        primaryColor={`${theme === 'light' ? '#730c70' : '#a3a3a3'}`}
                                        secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#faf4d1'}`}
                                    />}
                                    onPress={() => {
                                        // Write text to clipboard take the original link of the page
                                        navigator.clipboard.writeText(window.location.href);

                                        showSuccessMessage({success: "Store Link Copied!"});
                                    }}
                                >
                                    Copy Store Link
                                </DropdownItem>

                            </>
                            )
                        }
                    </DropdownMenu>
                </Dropdown>
            </div>
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
                        className={"max-w-[300px] md:max-w-[400px] md:text-lg"}
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
