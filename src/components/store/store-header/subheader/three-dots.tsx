'use client';
import React, { useState } from 'react';
import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@heroui/react";
import {IconCopy, IconDots} from "@/components/ui/icons";
import showSuccessMessage from "@/components/toast/toast-succes";
import {Icon} from "@iconify/react";
import {useTheme} from "next-themes";
import {useSession} from "@/components/providers/session-provider";
import {useRouter} from "next/navigation";
import {useStore} from "@/components/providers/store-provider";


const ThreeDotsDropdown: React.FC<{ children?: React.ReactNode }> = ({ children }) => {

    const [isLoading, setIsLoading] = useState(false);
    const { theme } = useTheme();
    const { session } = useSession();
    const router = useRouter();
    const { store } = useStore();


    return (
        <Dropdown className="flex flex-row" backdrop="blur">
            <DropdownTrigger>
                { children ||
                    <Button
                        isIconOnly
                        size="lg"
                        color="default"
                        variant="light"
                        isLoading={isLoading}
                        className="hover:bg-primary h-12 border-2 border-default-200 shadow-sm"
                    >
                    {!isLoading && (
                        <IconDots
                            size={44}
                            primaryColor={
                                theme === "light" ? "#5d5d5b" : "#faf4d1"
                            }
                        />
                    )}
                    </Button>
                }

            </DropdownTrigger>
            <DropdownMenu aria-label="Static Actions" variant="faded">
                {session?.user?.role === "bakerz" ? (
                    <>
                        <DropdownItem
                            key="link"
                            endContent={
                                <IconCopy
                                    size={24}
                                    primaryColor={
                                        theme === "light" ? "#730c70" : "#a3a3a3"
                                    }
                                    secondaryColor={
                                        theme === "light" ? "#5d5d5b" : "#faf4d1"
                                    }
                                />
                            }
                            onPress={() => {
                                navigator.clipboard.writeText('https://thebakerz.com/' + store?.storeName);
                                showSuccessMessage({ success: "Store Link Copied!" });
                            }}
                        >
                            Copy Store Link
                        </DropdownItem>
                        <DropdownItem
                            key="profile"
                            endContent={
                                <Icon
                                    className="text-default-500"
                                    icon="solar:settings-broken"
                                    width={24}
                                />
                            }
                            onPress={() => {
                                setIsLoading(true);
                                router.push("/settings?tab=profile");
                                router.refresh();
                            }}
                        >
                            Edit Profile
                        </DropdownItem>
                        <DropdownItem
                            key="schedule"
                            endContent={
                                <Icon
                                    className="text-default-500"
                                    icon="solar:calendar-broken"
                                    width={24}
                                />
                            }
                            onPress={() => {
                                setIsLoading(true);
                                router.push("/settings?tab=calendar");
                                router.refresh();
                            }}
                        >
                            Edit Schedule
                        </DropdownItem>
                        <DropdownItem
                            key="support"
                            endContent={
                                <Icon
                                    className="text-default-500"
                                    icon="solar:info-circle-line-duotone"
                                    width={24}
                                />
                            }
                            onPress={() => {
                                setIsLoading(true);
                                router.push("/support");
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
                            endContent={
                                <IconCopy
                                    size={24}
                                    primaryColor={
                                        theme === "light" ? "#730c70" : "#a3a3a3"
                                    }
                                    secondaryColor={
                                        theme === "light" ? "#5d5d5b" : "#faf4d1"
                                    }
                                />
                            }
                            onPress={() => {
                                navigator.clipboard.writeText('https://thebakerz.com/' + store?.storeName);
                                showSuccessMessage({ success: "Store Link Copied!" });
                            }}
                        >
                            Copy Store Link
                        </DropdownItem>
                        <DropdownItem
                            key="support"
                            endContent={
                                <Icon
                                    className="text-default-900"
                                    icon="solar:info-circle-line-duotone"
                                    width={24}
                                />
                            }
                            onPress={() => {
                                setIsLoading(true);
                                router.push("/support");
                                router.refresh();
                            }}
                        >
                            Get Help
                        </DropdownItem>
                        <DropdownItem
                            key="report"
                            endContent={
                                <Icon
                                    className="text-default-500"
                                    icon="solar:danger-broken"
                                    width={24}
                                />
                            }
                            onPress={() => {
                                setIsLoading(true);
                                router.push("/support/contact-us");
                                router.refresh();
                            }}
                        >
                            Report
                        </DropdownItem>
                    </>
                )}
            </DropdownMenu>
        </Dropdown>
    );
};

export default ThreeDotsDropdown;