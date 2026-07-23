/**
 * @fileoverview Store actions dropdown menu with role-based items.
 *
 * Exports the ThreeDotsDropdown client component. For users with the
 * "bakerz" role it offers copy/share store link plus navigation to store,
 * pickup, delivery, products, rescue-deal, add-order, and support pages;
 * for other users it offers copy link, support, and report options. A custom
 * trigger can be supplied via children.
 */
'use client';
import React, { useState } from 'react';
import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@heroui/react";
import {IconCopy} from "@/components/ui/icons";
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
                        aria-label="Open actions"
                        isIconOnly
                        size="lg"
                        color="default"
                        isLoading={isLoading}
                        className="h-12 "
                    >
                        {!isLoading && (
                            <Icon
                                icon="solar:settings-broken"
                                width={32}
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
                                        theme === "light" ? "#730c70" : "#f7f6f5"
                                    }
                                    secondaryColor={
                                        theme === "light" ? "#131316" : "#f7f6f5"
                                    }
                                />
                            }
                            onPress={() => {
                                if (navigator.share) {
                                    navigator.share({   
                                        title: store?.storeName || "Check out this store",
                                        text: `Check out ${store?.storeName || "this store"} on TheBakerz!`,
                                        url: origin + '/' + storeUrl
                                    }).catch(err => console.log("Share failed:", err));
                                } else {
                                    navigator.clipboard.writeText(origin + '/' + storeUrl);
                                    showSuccessMessage({ success: t("storeLinkCopied") });
                                }
                            }}
                        >
                            {t("copyStoreLink")}
                        </DropdownItem>
                        <DropdownItem
                            key="profile"
                            endContent={
                                <Icon
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
                            key="products"
                            endContent={
                                <Icon
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
                            key="rescue-deal"
                            endContent={
                                <Icon
                                    icon="material-symbols:eco-outline"
                                    width={24}
                                />
                            }
                            onPress={() => {
                                setIsLoading(true);
                                router.push("/" + storeUrl + "/rescue-deal");
                                router.refresh();
                            }}
                        >
                            {t("editRescueDeal")}
                        </DropdownItem>
                        <DropdownItem
                            key="order"
                            endContent={
                                <Icon
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
                                    className="text-foreground"
                                    icon="solar:info-circle-linear"
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
                                    className="text-foreground"
                                    icon="solar:info-circle-linear"
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