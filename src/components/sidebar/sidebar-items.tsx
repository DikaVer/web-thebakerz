

import {type SidebarItem, SidebarItemType} from "./sidebar";

/**
 * Please check the https://nextui.org/docs/guide/routing to have a seamless router integration
 */
export const sectionItemsGuestTheBakerz: SidebarItem[] = [
    {
        key: "",
        href: "/",
        icon: "solar:magnifer-linear",
        titleKey: "search"
    },
    {
        key: "about-us",
        href: "/about-us",
        icon: "solar:users-group-two-rounded-outline",
        titleKey: "aboutTheBakerz"
    },
    {
        key: "/become-partner#join-thebakerz",
        href: "/become-partner#join-thebakerz",
        titleKey: "joinTheBakerz",
        icon: "solar:chef-hat-heart-broken",
    }
];

export const sectionItemsGuestStore: SidebarItem[] = [
    {
        key: "navigation",
        titleKey: "navigation",
        items: [
            {
                key: "",
                href: "/",
                icon: "solar:magnifer-linear",
                titleKey: "search"
            },
            {
                key: "about-us",
                href: "/about-us",
                icon: "solar:users-group-two-rounded-outline",
                titleKey: "aboutTheBakerz"
            },
            {
                key: "/become-partner#join-thebakerz",
                href: "/become-partner#join-thebakerz",
                titleKey: "joinTheBakerz",
                icon: "solar:chef-hat-heart-broken",
            }
        ],
    }
];

export const sectionStoreItemsUser: SidebarItem[] = [
    {
        key: "account",
        titleKey: "account",
        items: [
            {
                key: "orders",
                href: "/orders",
                icon: "solar:notification-unread-lines-broken",
                titleKey: "orders"
            },
        ],
    },
    {
        key: "navigation",
        titleKey: "navigation",
        items: [
            {
                key: "",
                href: "/",
                icon: "solar:magnifer-linear",
                titleKey: "search"
            },
            {
                key: "about-us",
                href: "/about-us",
                icon: "solar:users-group-two-rounded-outline",
                titleKey: "aboutTheBakerz"
            },
            {
                key: "/become-partner#join-thebakerz",
                href: "/become-partner#join-thebakerz",
                titleKey: "joinTheBakerz",
                icon: "solar:chef-hat-heart-broken",
            }
        ],
    },
];

export const sectionItemsTheBakerz: SidebarItem[] = [
    {
        key: "navigation",
        titleKey: "navigation",
        items: [
            {
                key: "",
                href: "/",
                icon: "solar:magnifer-linear",
                titleKey: "search"
            },
            {
                key: "about-us",
                href: "/about-us",
                icon: "solar:users-group-two-rounded-outline",
                titleKey: "aboutTheBakerz"
            },
            {
                key: "/become-partner#join-thebakerz",
                href: "/become-partner#join-thebakerz",
                titleKey: "joinTheBakerz",
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
        titleKey: "navigation",
        items: [
            {
                key: "",
                href: "/",
                icon: "solar:magnifer-linear",
                titleKey: "search"
            },
            {
                key: "about-us",
                href: "/about-us",
                icon: "solar:users-group-two-rounded-outline",
                titleKey: "aboutTheBakerz"
            }
        ],
    },
];

export const sectionItemsAdmin: SidebarItem[] = [
    {
        key: "account",
        titleKey: "account",
        items: [
            {
                key: "dashboard-navigation",
                icon: "solar:widget-2-outline",
                titleKey: "dashboard",
                type: SidebarItemType.Nest,
                items: [
                    {
                        key: "dashboard",
                        icon: "solar:bomb-emoji-broken",
                        href: "/dashboard",
                        titleKey: "overview"
                    },
                    {
                        key: "dashboard/orders",
                        icon: "solar:notification-unread-lines-broken",
                        href: "/dashboard/orders",
                        titleKey: "orders"
                    },
                    {
                        key: "dashboard/users",
                        icon: "solar:user-hand-up-broken",
                        href: "/dashboard/users",
                        titleKey: "users"
                    },
                    {
                        key: "dashboard/stripe",
                        icon: "solar:shop-2-broken",
                        href: "/dashboard/stripe",
                        titleKey: "stripe"
                    },
                ],
            },
        ],
    },
    {
        key: "navigation",
        titleKey: "navigation",
        items: [
            {
                key: "",
                href: "/",
                icon: "solar:magnifer-linear",
                titleKey: "search"
            },
            {
                key: "about-us",
                href: "/about-us",
                icon: "solar:users-group-two-rounded-outline",
                titleKey: "aboutTheBakerz"
            }
        ],
    },
];