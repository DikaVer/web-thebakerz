import {Chip} from "@heroui/react";
import {Icon} from "@iconify/react";

import {type SidebarItem, SidebarItemType} from "./sidebar";
import {pacifico} from "@/components/fonts";

/**
 * Please check the https://nextui.org/docs/guide/routing to have a seamless router integration
 */


export const sectionItemsUser: SidebarItem[] = [
    {
        key: "account",
        title: "Account",
        items: [
            {
                key: "orders",
                href: "/orders",
                title: "Orders",
                icon: "solar:bill-list-broken",
            },
            {
                key: "chat",
                href: "/chat",
                icon: "solar:chat-round-line-broken",
                title: "Chat",
            },
            {
                key: "favorites",
                href: "/favorites",
                icon: "solar:chat-square-like-broken",
                title: "Favorites",
            },
            {
                key: "payments",
                href: "/payments",
                icon: "solar:wallet-money-broken",
                title: "Payments",
            },
        ],
    },
    {
        key: "overview",
        title: "Overview",
        items: [
            {
                key: "",
                href: "/",
                icon: "solar:home-2-linear",
                title: "Home",
            },
            {
                key: "search",
                href: "/search",
                icon: "lucide:search",
                title: "Search",
                endContent: (
                    <Chip size="md" className={`${pacifico.className}`} variant="flat">
                        Coming soon!        </Chip>
                ),
            },
            {
                key: "about-us",
                href: "/about-us",
                icon: "solar:users-group-two-rounded-outline",
                title: "About Us",
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

export const sectionItemsBakerz: SidebarItem[] = [
];

export const sectionItemsAdmin: SidebarItem[] = [
    {
        key: "account",
        title: "Account",
        items: [
            {
                key: "orders",
                href: "/orders",
                title: "Orders",
                icon: "solar:bill-list-broken",
            },
            {
                key: "chat",
                href: "/chat",
                icon: "solar:chat-round-line-broken",
                title: "Chat",
            },
            {
                key: "favorites",
                href: "/favorites",
                icon: "solar:chat-square-like-broken",
                title: "Favorites",
            },
            {
                key: "payments",
                href: "/payments",
                icon: "solar:wallet-money-broken",
                title: "Payments",
            },
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
                        key: "dashboard/applications",
                        icon: "solar:chef-hat-broken",
                        href: "/dashboard/applications",
                        title: "Applications",
                    },
                    {
                        key: "dashboard/orders",
                        icon: "solar:bill-list-broken",
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
                        key: "dashboard/stores",
                        icon: "solar:shop-2-broken",
                        href: "/dashboard/stores",
                        title: "Stores",
                    },
                    {
                        key: "dashboard/settings",
                        icon: "solar:settings-broken",
                        href: "/dashboard/settings",
                        title: "Settings",
                    },
                    {
                        key: "dashboard/session",
                        icon: "solar:accessibility-broken",
                        href: "/dashboard/session",
                        title: "Session",
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
                key: "search",
                href: "/search",
                icon: "lucide:search",
                title: "Search",
                endContent: (
                    <Chip size="md" className={`${pacifico.className}`} variant="flat">
                        Coming soon!        </Chip>
                ),
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

export const sectionItemsGuestTheBakerz: SidebarItem[] = [
        {
            key: "",
            href: "/",
            icon: "solar:home-2-linear",
            title: "TheBakerz",
        },
        // {
        //     key: "search",
        //     href: "/search",
        //     icon: "lucide:search",
        //     title: "Search",
        //     endContent: (
        //         <Chip size="md" className={`${pacifico.className}`} variant="flat">
        //             Coming soon!        </Chip>
        //     ),
        // },
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


export const brandItems: SidebarItem[] = [  {
    key: "overview",
    title: "Overview",
    items: [
        {
            key: "home",
            href: "#",
            icon: "solar:home-2-linear",
            title: "Home",
        },
        {
            key: "projects",
            href: "#",
            icon: "solar:widget-2-outline",
            title: "Projects",
            endContent: (
                <Icon
                    className="text-primary-foreground/60"
                    icon="solar:add-circle-line-duotone"
                    width={24}
                />
            ),
        },
        {
            key: "tasks",
            href: "#",
            icon: "solar:checklist-minimalistic-outline",
            title: "Tasks",
            endContent: (
                <Icon
                    className="text-primary-foreground/60"
                    icon="solar:add-circle-line-duotone"
                    width={24}
                />
            ),
        },
        {
            key: "team",
            href: "#",
            icon: "solar:users-group-two-rounded-outline",
            title: "Team",
        },
        {
            key: "tracker",
            href: "#",
            icon: "solar:sort-by-time-linear",
            title: "Tracker",
            endContent: (
                <Chip className="bg-primary-foreground font-medium text-primary" size="sm" variant="flat">
                    New          </Chip>
            ),
        },
    ],
},
    {
        key: "your-teams",
        title: "Your Teams",
        items: [
            {
                key: "nextui",
                href: "#",
                title: "NextUI",
            },
            {
                key: "tailwind-variants",
                href: "#",
                title: "Tailwind Variants",
            },
            {
                key: "nextui-pro",
                href: "#",
                title: "NextUI Pro",
            },
        ],
    },
];


export const sectionNestedItems: SidebarItem[] = [  {
    key: "home",
    href: "#",
    icon: "solar:home-2-linear",
    title: "Home",
},
    {
        key: "projects",
        href: "#",
        icon: "solar:widget-2-outline",
        title: "Projects",
        endContent: (
            <Icon className="text-default-400" icon="solar:add-circle-line-duotone" width={24} />
        ),
    },
    {
        key: "tasks",
        href: "#",
        icon: "solar:checklist-minimalistic-outline",
        title: "Tasks",
        endContent: (
            <Icon className="text-default-400" icon="solar:add-circle-line-duotone" width={24} />
        ),
    },
    {
        key: "team",
        href: "#",
        icon: "solar:users-group-two-rounded-outline",
        title: "Team",
    },
    {
        key: "tracker",
        href: "#",
        icon: "solar:sort-by-time-linear",
        title: "Tracker",
        endContent: (
            <Chip size="sm" variant="flat">
                New      </Chip>
        ),
    },
    {
        key: "analytics",
        href: "#",
        icon: "solar:chart-outline",
        title: "Analytics",
    },
    {
        key: "perks",
        href: "#",
        icon: "solar:gift-linear",
        title: "Perks",
        endContent: (
            <Chip size="sm" variant="flat">
                3      </Chip>
        ),
    },
    {
        key: "cap_table",
        title: "Cap Table",
        icon: "solar:pie-chart-2-outline",
        type: SidebarItemType.Nest,
        items: [
            {
                key: "shareholders",
                icon: "solar:users-group-rounded-linear",
                href: "#",
                title: "Shareholders",
            },
            {
                key: "note_holders",
                icon: "solar:notes-outline",
                href: "#",
                title: "Note Holders",
            },
            {
                key: "transactions_log",
                icon: "solar:clipboard-list-linear",
                href: "#",
                title: "Transactions Log",
            },
        ],
    },
    {
        key: "expenses",
        href: "#",
        icon: "solar:bill-list-outline",
        title: "Expenses",
    },
];