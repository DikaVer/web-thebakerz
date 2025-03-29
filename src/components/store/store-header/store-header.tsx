"use client";

import React, {useEffect, useState, useRef} from "react";
import {useStore} from "@/components/providers/store-provider";
import {Link, Avatar, Spacer, Divider, Button, useDisclosure, cn, Switch, ButtonGroup, Spinner} from "@heroui/react";
import {Icon} from "@iconify/react";
import {pacifico} from "@/components/fonts";
import {StoreSubHeader} from "@/components/store/store-header/store-subheader";
import {useMediaQuery} from "usehooks-ts";
import {useSession} from "@/components/providers/session-provider";
import StoreDescription from "@/components/store/store-header/description/store-description";
import {useTranslations} from "next-intl";
import {useRouter} from "next/navigation";
import { setDeliveryMode, getDeliveryMode, type DeliveryMode } from '@/lib/delivery-cookie';
import { useDebouncedCallback } from "use-debounce";

interface StoreHeaderProps {
    isDeliveryProps: boolean;
}

export function StoreHeader( { isDeliveryProps }: StoreHeaderProps) {
    const { store } = useStore();
    const { session } = useSession();
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const isSmall = useMediaQuery("(max-width: 960px)");
    const t = useTranslations("app/(store)/components/store-header");
    const router = useRouter();
    const [isDelivery, setIsDelivery] = useState(isDeliveryProps);
    const [isTogglingDelivery, setIsTogglingDelivery] = useState(false);
    const [isSubheaderLoaded, setIsSubheaderLoaded] = useState(true);

    const handleDeliveryToggle = async (value: boolean) => {
        // Skip if we're already toggling or if the value didn't change
        if (isTogglingDelivery) return;

        setIsTogglingDelivery(true);
        setIsDelivery(value);
        await setDeliveryMode(value ? 'delivery' : 'pickup');
        setIsTogglingDelivery(false);
    };

    // Handler to update subheader loaded state
    const handleSubheaderLoaded = (loaded: boolean) => {
        if (loaded !== isSubheaderLoaded) {
            setIsSubheaderLoaded(loaded);
        }
    };

    return (
        <div className="w-full max-w-screen-xl mx-auto flex flex-col">
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
            {(store.deliveryOption === "multi" && session?.user?.role !== "bakerz" && session.store?.id !== store.id) && (
                <div className="flex items-center justify-end w-full py-4">
                    <div className="relative p-1 rounded-xl bg-default-100 shadow-sm">
                        <ButtonGroup className="relative z-10 overflow-hidden" isDisabled={isTogglingDelivery || !isSubheaderLoaded}>
                            <Button
                                disableRipple
                                onPress={() => handleDeliveryToggle(false)}
                                className={cn(
                                    "min-w-32 transition-all duration-300 data-[hover=true]:bg-transparent",
                                    !isDelivery ? "text-primary font-medium" : "text-default-500 font-normal",
                                    isTogglingDelivery || !isSubheaderLoaded ? "opacity-50" : "opacity-100"
                                )}
                                variant="light"
                                isDisabled={isTogglingDelivery || !isSubheaderLoaded}
                            >
                                <div className="flex items-center gap-2">
                                    <Icon
                                        icon="solar:shop-2-bold"
                                        width={20}
                                        height={20}
                                        className={cn(
                                            "transition-all duration-300",
                                            !isDelivery ? "text-primary" : "text-default-500"
                                        )}
                                    />
                                    <span className="text-sm">{t('pickup')}</span>
                                </div>
                            </Button>
                            <Button
                                disableRipple
                                onPress={() => handleDeliveryToggle(true)}
                                className={cn(
                                    "min-w-32 transition-all duration-300 data-[hover=true]:bg-transparent",
                                    isDelivery ? "text-primary font-medium" : "text-default-500 font-normal",
                                    isTogglingDelivery || !isSubheaderLoaded ? "opacity-50" : "opacity-100"
                                )}
                                variant="light"
                                isDisabled={isTogglingDelivery || !isSubheaderLoaded}
                            >
                                <div className="flex items-center gap-2">
                                    <Icon
                                        icon="solar:scooter-bold"
                                        width={20}
                                        height={20}
                                        className={cn(
                                            "transition-all duration-300",
                                            isDelivery ? "text-primary" : "text-default-500"
                                        )}
                                    />
                                    <span className="text-sm">{t('delivery')}</span>
                                </div>
                            </Button>
                        </ButtonGroup>
                        {/* Animated background pill */}
                        <div 
                            className={cn(
                                "absolute top-1 bottom-1 w-[calc(50%-2px)] rounded-lg bg-default-50 dark:bg-default-700 shadow-md transition-all duration-300",
                                isDelivery ? "translate-x-[calc(100%+2px)]" : "translate-x-[1px]"
                            )}
                            style={{ 
                                left: 0
                            }}
                        />
                    </div>
                </div>
            )}
            {(session?.user?.role !== "bakerz" && session.store?.id !== store.id) ?
                <StoreSubHeader 
                    isDelivery={isDelivery} 
                    key={`subheader-${isDelivery ? 'delivery' : 'pickup'}`}
                    onLoadingStateChange={handleSubheaderLoaded}
                />
            :
                <StoreSubHeader isDelivery={false} />
            }
        </div>
    );
}