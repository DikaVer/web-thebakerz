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
import {useTranslations} from "next-intl";

const ThreeDotsDropdown: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { theme } = useTheme();
    const { session } = useSession();
    const router = useRouter();
    const { store } = useStore();
    const t = useTranslations("app/(store)/components/three-dots");
    const storeUrl = store?.storeName ? store?.storeName : store?.id;
    // Get origin of the current page from window object
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    
    // Check if user has bakerz role
    const isBakerz = !!session?.user?.role && session.user.role === "bakerz";

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
                        className="h-12 border-2  shadow-sm"
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
                {isBakerz ? (
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
                                navigator.clipboard.writeText(origin + '/' + storeUrl);
                                showSuccessMessage({ success: t("storeLinkCopied") });
                            }}
                        >
                            {t("copyStoreLink")}
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
                                router.push("/" + storeUrl + "/settings?tab=store");
                                router.refresh();
                            }}
                        >
                            {t("editStore")}
                        </DropdownItem>
                        <DropdownItem
                            key="Pickup"
                            endContent={
                                <Icon
                                    className="text-default-500"
                                    icon="solar:calendar-broken"
                                    width={24}
                                />
                            }
                            onPress={() => {
                                setIsLoading(true);
                                router.push("/" + storeUrl + "/settings?tab=pickup");
                                router.refresh();
                            }}
                        >
                            {t("editPickup")}
                        </DropdownItem>
                        <DropdownItem
                            key="delivery"
                            endContent={
                                <Icon
                                    className="text-default-500"
                                    icon="solar:scooter-linear"
                                    width={24}
                                />
                            }
                            onPress={() => {
                                setIsLoading(true);
                                router.push("/" + storeUrl + "/settings?tab=delivery");
                                router.refresh();
                            }}
                        >
                            {t("editDelivery")}
                        </DropdownItem>
                        <DropdownItem
                            key="delivery"
                            endContent={
                                <Icon
                                    className="text-default-500"
                                    icon="solar:scooter-linear"
                                    width={24}
                                />
                            }
                            onPress={() => {
                                setIsLoading(true);
                                router.push("/settings?tab=delivery");
                                router.refresh();
                            }}
                        >
                            {t("editDelivery")}
                        </DropdownItem>
                        <DropdownItem
                            key="products"
                            endContent={
                                <Icon
                                    className="text-default-500"
                                    icon="solar:bag-5-broken"
                                    width={24}
                                />
                            }
                            onPress={() => {
                                setIsLoading(true);
                                router.push("/" + storeUrl + "/products");
                                router.refresh();
                            }}
                        >
                            {t("editProducts")}
                        </DropdownItem>
                        <DropdownItem
                            key="order"
                            endContent={
                                <Icon
                                    className="text-default-500"
                                    icon="solar:document-add-linear"
                                    width={24}
                                />
                            }
                            onPress={() => {
                                setIsLoading(true);
                                router.push("/" + storeUrl + "/orders/add");
                                router.refresh();
                            }}
                        >
                            {t("addOrder")}
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
                            {t("getHelp")}
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
                                navigator.clipboard.writeText('https://thebakerz.com/' + storeUrl);
                                showSuccessMessage({ success: t("storeLinkCopied") });
                            }}
                        >
                            {t("copyStoreLink")}
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
                            {t("getHelp")}
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
                            {t("report")}
                        </DropdownItem>
                    </>
                )}
            </DropdownMenu>
        </Dropdown>
    );
};

export default ThreeDotsDropdown;