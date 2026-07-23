/**
 * @fileoverview Sign-out button for the dashboard sidebar.
 *
 * Exports SignOutButton, which clears session and local storage, resets the
 * session context, runs the logout server action, and redirects through the
 * transit-exit page. Collapses to an icon-only button with a tooltip when the
 * sidebar is collapsed.
 */
"use client";

import {usePathname, useRouter} from "next/navigation";
import React, {startTransition, useState} from "react";
import {Button, cn, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";
import {logoutAction} from "@/app/actions";
import {useSession} from "@/components/providers/session-provider";
import {useTranslations} from "next-intl";

interface SignOutButtonProps {
    isCollapsed: boolean;
}
export const SignOutButton = ({isCollapsed} : SignOutButtonProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const { session, setSession } = useSession();
    const [ isLoading, setIsLoading ] = useState(false);
    const t = useTranslations("app/(components)/signout-button");

    const handleSignOut = () => {
        startTransition(async () => {
            sessionStorage.clear();
            localStorage.clear();
            setSession((prevSession) => {
                return {
                    ...prevSession,
                    session: null,
                    user: null,
                    stores: null,
                };
            });
            await logoutAction();
            router.refresh();
            router.push(`/transit-exit?next=${pathname}`);
        });
    };

    return (
        <Tooltip content={t("logOut")} isDisabled={!isCollapsed} placement="right">
            <Button
                aria-label="Sign out"
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
                isLoading={isLoading}
            >
                {!isLoading && isCollapsed ? (
                    <Icon
                        className="rotate-180 text-grayText"
                        icon="solar:minus-circle-line-duotone"
                        width={24}
                    />
                ) : (
                    t("signOut")
                )}
            </Button>
        </Tooltip>
    );
}