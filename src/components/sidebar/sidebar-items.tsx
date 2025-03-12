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
        title: "TheBakerz"
    },
    {
        key: "about-us",
        href: "/about-us",
        icon: "solar:users-group-two-rounded-outline",
        title: "About TheBakerz",
    },
    {
        key: "#join-thebakerz",
        href: "/#join-thebakerz",
        title: "Join TheBakerz",
        icon: "solar:chef-hat-heart-broken",
    }
];

export const sectionItemsGuestStore: SidebarItem[] = [
    {
        key: "",
        href: "/auth",
        icon: "line-md:login",
        title: "Sign in"
    },
];

export const sectionStoreItemsUser: SidebarItem[] = [
    {
        key: "account",
        title: "Account",
        items: [
            {
                key: "payments",
                href: "/payments",
                icon: "solar:wallet-money-broken",
                title: "Payments",
            },
        ],
    }
];

export const sectionItemsTheBakerz: SidebarItem[] = [
    {
        key: "navigation",
        title: "Navigation",
        items: [
            {
                key: "",
                href: "/",
                icon: "solar:home-2-linear",
                title: "TheBakerz",
            },
            {
                key: "about-us",
                href: "/about-us",
                icon: "solar:users-group-two-rounded-outline",
                title: "About TheBakerz",
            },
            {
                key: "#join-thebakerz",
                href: "/#join-thebakerz",
                title: "Join TheBakerz",
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
        title: "Navigation",
        items: [
            {
                key: "",
                href: "/",
                icon: "solar:home-2-linear",
                title: "TheBakerz",
            },
            {
                key: "about-us",
                href: "/about-us",
                icon: "solar:users-group-two-rounded-outline",
                title: "About TheBakerz",
            }
        ],
    },

];

export const sectionItemsAdmin: SidebarItem[] = [
    {
        key: "account",
        title: "Account",
        items: [
            {
                key: "dashboard-navigation",
                icon: "solar:widget-2-outline",
                title: "Dashboard",
                type: SidebarItemType.Nest,
                items: [
                    {
                        key: "dashboard",
                        icon: "solar:bomb-emoji-broken",
                        href: "/dashboard",
                        title: "Overview",
                    },
                    {
                        key: "dashboard/orders",
                        icon: "solar:notification-unread-lines-broken",
                        href: "/dashboard/orders",
                        title: "Orders",
                    },
                    {
                        key: "dashboard/users",
                        icon: "solar:user-hand-up-broken",
                        href: "/dashboard/users",
                        title: "Users",
                    },
                    {
                        key: "dashboard/stripe",
                        icon: "solar:shop-2-broken",
                        href: "/dashboard/stripe",
                        title: "Stripe",
                    },
                ],
            },
        ],
    },
    {
        key: "navigation",
        title: "Navigation",
        items: [
            {
                key: "",
                href: "/",
                icon: "solar:home-2-linear",
                title: "TheBakerz",
            },
            {
                key: "about-us",
                href: "/about-us",
                icon: "solar:users-group-two-rounded-outline",
                title: "About TheBakerz",
            }
        ],
    },
];

