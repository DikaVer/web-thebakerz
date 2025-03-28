"use client";

import React, {useEffect} from "react";
import {useStore} from "@/components/providers/store-provider";
import {Link, Avatar, Spacer, Divider, Button, useDisclosure, cn, Switch, ButtonGroup} from "@heroui/react";
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
import { setDeliveryMode, getDeliveryMode, type DeliveryMode } from '@/lib/delivery-cookie';

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
    const t = useTranslations("app/(store)/components/store-header");
    const router = useRouter();
    const [isDelivery, setIsDelivery] = React.useState(false);


    // Initialize the delivery state from cookie on component mount
    useEffect(() => {
        const fetchDeliveryMode = async () => {
            const mode = await getDeliveryMode();
            if (store.deliveryOption === "delivery" && mode === "pickup") {
                setIsDelivery(store.deliveryOption === 'delivery');
                await setDeliveryMode(store.deliveryOption ? 'delivery' : 'pickup');
            } else {
                setIsDelivery(mode === 'delivery');
            }
        };
        fetchDeliveryMode();
    }, []);

    const handleDeliveryToggle = async (value: boolean) => {
        setIsDelivery(value);
        await setDeliveryMode(value ? 'delivery' : 'pickup');
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
            {(store.deliveryOption === "multi" && session?.user?.role !== "bakerz" && session.store?.id !== store.id) && (
                <div className="flex items-center justify-end w-full gap-6 py-3">
                    <ButtonGroup>
                        <Button
                            onPress={() => handleDeliveryToggle(false)}
                            className={cn(
                                !isDelivery ? "bg-default-50 text-primary" : "text-default-400"
                            )}
                        >
                            <div className="relative w-12 h-12 flex items-center justify-center">
                                <Icon
                                    icon="solar:shop-2-bold"
                                    width={32}
                                    height={32}
                                    className={cn(
                                        "transition-all duration-200",
                                        !isDelivery ? "scale-110" : "scale-100"
                                    )}
                                />
                            </div>
                            <span className="text-sm font-medium">
                            {t('pickup')}
                        </span>
                        </Button>
                        <Button
                            onPress={() => handleDeliveryToggle(true)}
                            className={cn(
                                isDelivery ? "bg-default-50 text-primary" : "text-default-400"
                            )}
                        >
                            <div className="relative w-12 h-12 flex items-center justify-center">
                                <Icon
                                    icon="solar:scooter-linear"
                                    width={32}
                                    height={32}
                                    className={cn(
                                        "transition-all duration-200",
                                        isDelivery ? "scale-110" : "scale-100"
                                    )}
                                />
                            </div>
                            <span className="text-sm font-medium">
                            {t('delivery')}
                        </span>
                        </Button>
                    </ButtonGroup>
                </div>
            )}
            <StoreSubHeader dateParam={dateParam} timeParam={timeParam} isDelivery={isDelivery}/>
        </div>
    );
}