import {Chip} from "@heroui/react";
import {Icon} from "@iconify/react";

import {type SidebarItem, SidebarItemType} from "./sidebar";
import {pacifico} from "@/components/fonts";

/**
 * Please check the https://nextui.org/docs/guide/routing to have a seamless router integration
 */
export const sectionItemsGuestTheBakerz: SidebarItem[] = [
    {
        key: "",
        href: "/",
        icon: "solar:home-2-linear",
        titleKey: "App Name" // Changed to key
    },
    {
        key: "about-us",
        href: "/about-us",
        icon: "solar:users-group-two-rounded-outline",
        titleKey: "AboutTheBakerz", // Changed to key
    },
    {
        key: "#join-thebakerz",
        href: "/#join-thebakerz",
        titleKey: "JoinTheBakerz", // Changed to key
        icon: "solar:chef-hat-heart-broken",
    }
];

export const sectionItemsGuestStore: SidebarItem[] = [
    {
        key: "",
        href: "/auth",
        icon: "line-md:login",
        titleKey: "SignIn" // Changed to key
    },
];

export const sectionStoreItemsUser: SidebarItem[] = [
    {
        key: "account",
        titleKey: "Account", // Changed to key
        items: [
            // {
            //     key: "payments",
            //     href: "/payments",
            //     icon: "solar:wallet-money-broken",
            //     titleKey: "Payments", // Changed to key
            // },
        ],
    }
];

export const sectionItemsTheBakerz: SidebarItem[] = [
    {
        key: "navigation",
        titleKey: "Navigation", // Changed to key
        items: [
            {
                key: "",
                href: "/",
                icon: "solar:home-2-linear",
                titleKey: "App Name", // Changed to key
            },
            {
                key: "about-us",
                href: "/about-us",
                icon: "solar:users-group-two-rounded-outline",
                titleKey: "AboutTheBakerz", // Changed to key
            },
            {
                key: "#join-thebakerz",
                href: "/#join-thebakerz",
                titleKey: "JoinTheBakerz", // Changed to key
                icon: "solar:chef-hat-heart-broken",
            }
        ],
    },
];

export const sectionItemsUser: SidebarItem[] = [
    ...sectionStoreItemsUser,
    ...sectionItemsTheBakerz
];

export const sectionItemsBakerz: SidebarItem[] = [
    {
        key: "navigation",
        titleKey: "Navigation", // Changed to key
        items: [
            {
                key: "",
                href: "/",
                icon: "solar:home-2-linear",
                titleKey: "App Name", // Changed to key
            },
            {
                key: "about-us",
                href: "/about-us",
                icon: "solar:users-group-two-rounded-outline",
                titleKey: "AboutTheBakerz", // Changed to key
            }
        ],
    },
];

export const sectionItemsAdmin: SidebarItem[] = [
    {
        key: "account",
        titleKey: "Account", // Changed to key
        items: [
            {
                key: "dashboard-navigation",
                icon: "solar:widget-2-outline",
                titleKey: "Dashboard", // Changed to key
                type: SidebarItemType.Nest,
                items: [
                    {
                        key: "dashboard",
                        icon: "solar:bomb-emoji-broken",
                        href: "/dashboard",
                        titleKey: "Overview", // Changed to key
                    },
                    {
                        key: "dashboard/orders",
                        icon: "solar:notification-unread-lines-broken",
                        href: "/dashboard/orders",
                        titleKey: "Orders", // Changed to key
                    },
                    {
                        key: "dashboard/users",
                        icon: "solar:user-hand-up-broken",
                        href: "/dashboard/users",
                        titleKey: "Users", // Changed to key
                    },
                    {
                        key: "dashboard/stripe",
                        icon: "solar:shop-2-broken",
                        href: "/dashboard/stripe",
                        titleKey: "Stripe", // Changed to key
                    },
                ],
            },
        ],
    },
    {
        key: "navigation",
        titleKey: "Navigation", // Changed to key
        items: [
            {
                key: "",
                href: "/",
                icon: "solar:home-2-linear",
                titleKey: "App Name", // Changed to key
            },
            {
                key: "about-us",
                href: "/about-us",
                icon: "solar:users-group-two-rounded-outline",
                titleKey: "AboutTheBakerz", // Changed to key
            }
        ],
    },
];