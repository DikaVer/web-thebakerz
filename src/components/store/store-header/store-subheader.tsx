"use client";

import React, {useState} from "react";
import {useStore} from "@/components/providers/store-provider";
import {Avatar} from "@heroui/avatar";
import {useIsMobile} from "@/lib/hooks/use-mobile";
import {Button,  Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Spacer} from "@heroui/react";
import {IconCopy, IconDots, IconLocation, IconPhone, IconSupport} from "@/components/ui/icons";
import {useTheme} from "next-themes";
import {CopyText} from "@/components/table/copy-text";

import {useSession} from "@/components/providers/session-provider";
import showSuccessMessage from "@/components/toast/toast-succes";
import {DatePicker} from "@heroui/date-picker";
import {formatDateTime} from "@/lib/utils";
import {getLocalTimeZone, now, today} from "@internationalized/date";
import {Icon} from "@iconify/react";
import {useRouter} from "next/navigation";



export function StoreSubHeader() {

    const { session} = useSession();
    const { user } = session
    const isMobile  = useIsMobile();
    const { store } = useStore();
    const { theme } = useTheme();

    const location = store?.location.route ? `${store.location.route}, ${store.location.city}, ${store.location.zipCode}, ${store.location.country}` : "Location Placeholder";

    const today = new Date();
    const fromToday = formatDateTime(today);

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    return (
        <>
            <Spacer y={10}/>
            <div className={'flex flex-row w-full items-center max-w-[440px] md:max-w-[540px]'}>
                <DatePicker
                    CalendarTopContent={
                    null
                    }
                    hideTimeZone
                    showMonthAndYearPickers
                    minValue={now(getLocalTimeZone())}
                    //@ts-ignore
                    defaultValue={now(getLocalTimeZone())}
                    label="Schedule Order"
                    variant="bordered"
                    className={'w-full'}
                />
                <Spacer x={2}/>
                <div className={'flex flex-col items-start justify-start'}>
                    <Dropdown
                        className={'flex flex-row'}
                        backdrop="blur">
                        <DropdownTrigger>
                            <Button
                                isIconOnly
                                size={'lg'}
                                color={'default'}
                                variant="light"
                                isLoading={isLoading}

                                className={' hover:bg-primary border-2 border-default-200 h-14 shadow-sm'}
                            >
                                {
                                    !isLoading &&
                                    <IconDots
                                        size={44}
                                        primaryColor={`${theme === 'light' ? '#5d5d5b' : '#faf4d1'}`}
                                    />
                                }
                            </Button>
                            {/*<Button*/}
                            {/*    className={'w-full'}*/}
                            {/*>*/}
                            {/*    */}
                            {/*</Button>*/}
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Static Actions" variant="faded">
                            {user?.role === 'bakerz' ? (
                                <>
                                    <DropdownItem
                                        key="link"
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
                                    <DropdownItem
                                        key="profile"
                                        endContent={<Icon
                                            className="text-default-500"
                                            icon="solar:settings-broken"
                                            width={24}
                                        />}
                                        onPress={() => {
                                            setIsLoading(true);
                                            router.push('/settings?tab=profile');
                                            router.refresh();
                                        }}
                                    >
                                        Edit Profile
                                    </DropdownItem>
                                    <DropdownItem
                                        key="schedule"
                                        endContent={<Icon
                                            className="text-default-500"
                                            icon="solar:calendar-broken"
                                            width={24}
                                        />}
                                        onPress={() => {
                                            setIsLoading(true);
                                            router.push('/settings?tab=calendar');
                                            router.refresh();
                                        }}
                                    >
                                        Edit Schedule
                                    </DropdownItem>
                                    <DropdownItem
                                        key="support"
                                        endContent={<Icon
                                            className="text-default-500"
                                            icon="solar:info-circle-line-duotone"
                                            width={24}
                                        />}
                                        onPress={() => {
                                            setIsLoading(true);
                                            router.push('/support');
                                            router.refresh();
                                        }}
                                    >
                                        Get Help
                                    </DropdownItem>
                                </>
                            ) : (
                                <>
                                    <DropdownItem
                                        key="link"
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
                                    <DropdownItem
                                        key="support"
                                        endContent={<Icon
                                            className="text-default-900"
                                            icon="solar:info-circle-line-duotone"
                                            width={24}
                                        />}
                                        onPress={() => {
                                            setIsLoading(true);
                                            router.push('/support');
                                            router.refresh();
                                        }}
                                    >
                                        Get Help
                                    </DropdownItem>
                                    <DropdownItem
                                        key="report"

                                        endContent={<Icon
                                            className="text-default-500"
                                            icon="solar:danger-broken"
                                            width={24}
                                        />}
                                        onPress={() => {
                                            setIsLoading(true);
                                            router.push('/support/contact-us');
                                            router.refresh();
                                        }}
                                    >
                                        Report
                                    </DropdownItem>

                                </>
                            )
                            }
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>
        </>
    );
}
