"use server";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
} from "@/components/ui/sidebar"

import React from "react";
import {MenuItems} from "@/components/menu/menu-items";

interface AppSidebarProps {
    storeId?: string;  // Store ID
    main: boolean;  // Determines if the current page is the main page
    login: boolean;  // Specifies if the user is logged in
    role: string | undefined;  // Role of the user (e.g., admin, user)
    name: string | undefined | null;  // Name of the user
}

export async function AppSidebar({storeId, main, login, role, name }: AppSidebarProps) {

    return (
        <>
            <Sidebar>
                <MenuItems login={login} role={role} name={name}/>
            </Sidebar>
        </>
    )
}
