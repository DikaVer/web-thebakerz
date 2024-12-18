"use client";

import React, {useEffect} from "react";
import {useDisclosure} from "@nextui-org/react";
import {useMediaQuery} from "usehooks-ts";
import SidebarMenu from "@/components/sidebar/sidebar-menu";
import NavbarComponent from "@/components/navbar-comp";


interface Session {
    login: boolean;  // Specifies if the user is logged in
    role: string | undefined;  // Role of the user (e.g., admin, user)
    name: string | undefined | null;  // Name of the user
}

export default function LayoutComp({ children, session }: { children: React.ReactNode, session: Session }) {
    const { isOpen, onOpenChange } = useDisclosure();
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const isMobile = useMediaQuery("(max-width: 768px)");

    useEffect(() => {
        if (isMobile) {

        }
    }, [isMobile]);

    const onToggle = React.useCallback(() => {
        setIsCollapsed((prev) => !prev);
    }, []);

    return (
        <div className="flex w-full">
            {/* Sidebar */}
            <SidebarMenu
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                isCollapsed={isCollapsed}
                isMobile={isMobile}
                session={session}
            />

            <div className="w-full flex-1 flex-col">
                <NavbarComponent
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                    isMobile={isMobile}
                    onOpenChange={onOpenChange}
                    onToggle={onToggle}
                />
                <main className=" w-full overflow-visible">
                    {children}
                </main>
            </div>
        </div>
    );
}
