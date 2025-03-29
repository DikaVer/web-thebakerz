"use client";

import React, {useEffect, useState, useRef} from "react";
import {useStore} from "@/components/providers/store-provider";
import {Link, Avatar, Spacer, Divider, Button, useDisclosure, cn, Switch, ButtonGroup, Spinner} from "@heroui/react";
import {Icon} from "@iconify/react";
import {pacifico} from "@/components/fonts";
import {DeliverySubheader} from "@/components/store/store-header/delivery-subheader";
import {useMediaQuery} from "usehooks-ts";
import {useSession} from "@/components/providers/session-provider";
import StoreDescription from "@/components/store/store-header/description/store-description";
import {useTranslations} from "next-intl";
import {useRouter} from "next/navigation";
import { useDelivery } from "@/components/providers/delivery-provider";

interface StoreHeaderProps {

}

export function StoreHeader( {  }: StoreHeaderProps) {
    const { store } = useStore();
    const { session } = useSession();
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const isSmall = useMediaQuery("(max-width: 960px)");
    const t = useTranslations("app/(store)/components/store-header");
    const router = useRouter();
    
    // Use delivery provider instead of local state
    const { 
        isDelivery,
    } = useDelivery();

    // Check if user is a baker and owns this store
    const isOwner = session?.user?.role === "bakerz" && 
                   session?.store?.id && 
                   store?.id && 
                   session.store.id === store.id;
    
    // Determine if clicking on the header should trigger the cursor pointer style
    const showCursorPointer = session?.user?.role === "bakerz";

    return (
        <div className="w-full max-w-screen-xl mx-auto flex flex-col">
            <div
                className={`flex flex-row w-full justify-between`}
            >
                <div className={cn("flex flex-row gap-x-4 justify-center",
                    showCursorPointer && "cursor-pointer"
                )}
                     onClick={(e) => {
                         e.preventDefault();
                         if (session?.user?.role !== "bakerz" && isSmall) {
                             onOpen();
                         } else if (isOwner) {
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
            <DeliverySubheader/>
        </div>
    );
}