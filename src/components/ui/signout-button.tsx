"use client";

import {usePathname, useRouter} from "next/navigation";
import React, {startTransition} from "react";
import {Button, cn, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";
import {logoutAction} from "@/app/actions";
import {useSession} from "@/components/providers/session-provider";

interface SignOutButtonProps {
    isCollapsed: boolean;
}
export const SignOutButton = ({isCollapsed} : SignOutButtonProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const { session, setSession } = useSession();


    const handleSignOut = async () => {
        startTransition(() => {
            sessionStorage.clear();
            localStorage.clear();
            setSession((prevSession) => {
                return {
                    ...prevSession,
                    session: null,
                    user: null,
                    store: null
                };
            });
            logoutAction()
            router.push(`/transit-exit?next=${pathname}`);
            router.refresh();
        });
    };

    return (
        <Tooltip content="Log Out" isDisabled={!isCollapsed} placement="right">
            <Button
                className={cn("justify-start text-grayText data-[hover=true]:text-foreground data-[hover=true]:bg-default/40", {
                    "justify-center": isCollapsed,
                })}
                isIconOnly={isCollapsed}
                startContent={
                    isCollapsed ? null : (
                        <Icon
                            className="flex-none rotate-180 text-grayText"
                            icon="solar:minus-circle-line-duotone"
                            width={24}
                        />
                    )
                }
                onPress={handleSignOut}
                variant="light"
            >
                {isCollapsed ? (
                    <Icon
                        className="rotate-180 text-grayText"
                        icon="solar:minus-circle-line-duotone"
                        width={24}
                    />
                ) : (
                    "Sign Out"
                )}
            </Button>
        </Tooltip>
    );
}