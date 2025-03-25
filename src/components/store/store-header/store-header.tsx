"use client";

import React, {useEffect} from "react";
import {useStore} from "@/components/providers/store-provider";
import {Link, Avatar, Spacer, Divider, Button, useDisclosure, cn} from "@heroui/react";
import {Icon, IconProps} from "@iconify/react";
import Clarity from "@microsoft/clarity";
import {randomUUID} from "node:crypto";
import clarity from "@microsoft/clarity";
import {pacifico} from "@/components/fonts";
import {StoreSubHeader} from "@/components/store/store-header/store-subheader";
import {useMediaQuery} from "usehooks-ts";
import ThreeDotsDropdown from "@/components/store/store-header/subheader/three-dots";
import {useSession} from "@/components/providers/session-provider";
import {IconDots} from "@/components/ui/icons";
import { useTheme } from "next-themes";
import StoreDescription from "@/components/store/store-header/description/store-description";
import {useTranslations} from "next-intl";
import {useRouter} from "next/navigation";

type SocialIconProps = Omit<IconProps, "icon">;

interface StoreHeaderProps {
    dateParam: string | null;
    timeParam: string | null;
}

export function StoreHeader({dateParam, timeParam}: StoreHeaderProps) {
    const { store } = useStore();
    const { session } = useSession();
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const isSmall = useMediaQuery("(max-width: 960px)");
    const { theme } = useTheme();
    const t = useTranslations("app/(store)/components/store-header");
    const router = useRouter();

    const [latitude, longitude] = [store?.location.latitude, store?.location.longitude];

    const location = store?.location.route ? `${store.location.route}` : "";
    const subLocation = store?.location.route ? `${store.location.city}, ${store.location.zipCode}, ${store.location.country}` : "";

    const phone = {
        name: t("phone"),
        href: `tel:${store?.phone}`,
        icon: (props: SocialIconProps) => <Icon {...props} icon="line-md:phone-call" strokeWidth={1.5} width={24}/>,
    };

    return (
        <div>
            <div
                className={`flex flex-row w-full justify-between`}
            >
                <div className={cn("flex flex-row gap-x-4 justify-center",
                    session?.user?.role === "bakerz" && "cursor-pointer"
                )}
                     onClick={(e) => {
                         e.preventDefault();
                         if (session?.user?.role !== "bakerz" && isSmall) {
                             onOpen();
                         } else if (session?.user?.role === "bakerz" && session.store?.id === store.id) {
                             router.push("/settings");
                             router.refresh();
                         }
                     }}
                >
                    <div className={'w-[80px]'}>
                        <Avatar
                            isBordered
                            showFallback={!!store.picture}
                            className={`w-[80px] h-[80px] text-large`}
                            name={store.ownerName}
                            src={store.picture}
                            color={'primary'}
                            classNames={{
                                base: `bg-default text-text shadow-lg`,
                            }}
                        />
                    </div>
                    <div className={'flex  flex-col justify-center'}>
                        {store?.ownerName &&
                            <div className={'flex gap-x-4'}>
                                <p className={`text-xl whitespace-pre-wrap font-medium text-text ${pacifico.className}`}>
                                    {store.ownerName}
                                </p>

                                {!isSmall && (
                                    <>
                                        {store?.instagram_url && (
                                            <Link key={"Instagram"} isExternal className="text-blue-500 h-6"
                                                  href={store.instagram_url}>
                                                <span className="sr-only">{t("instagram")}</span>
                                                <Icon icon="line-md:instagram" strokeWidth={1.5} width={24}
                                                      aria-hidden="true"
                                                      className="w-6"/>
                                            </Link>
                                        )}
                                        {store?.facebook_url && (
                                            <Link key={"Facebook"} isExternal className="text-blue-500 h-6"
                                                  href={store.facebook_url}>
                                                <span className="sr-only">{t("facebook")}</span>
                                                <Icon icon="line-md:facebook" strokeWidth={1.5} width={24}
                                                      aria-hidden="true"
                                                      className="w-6"/>
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        }
                        {store?.slug &&
                            <p className={`text-xs md:text-sm whitespace-pre-wrap font-light text-default-600`}>{store.slug}</p>
                        }
                    </div>
                </div>
                { isSmall &&
                    <div className={'flex h-full justify-end'}>
                        <Button
                            isIconOnly
                            size="lg"
                            color="default"
                            variant="light"
                            className="h-4"
                            onPress={onOpen}
                        >
                            <Icon icon={"solar:menu-dots-bold"} width={36}/>
                        </Button>
                        <StoreDescription isOpen={isOpen} onOpenChange={onOpenChange}/>
                    </div>
                }
            </div>
            <Spacer y={4}/>
            <Divider/>
            <StoreSubHeader dateParam={dateParam} timeParam={timeParam}/>
        </div>
    );
}