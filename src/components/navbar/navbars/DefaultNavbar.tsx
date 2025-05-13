import { useState } from "react";
import { Button, NavbarBrand, NavbarContent, Avatar, ButtonGroup } from "@heroui/react";
import { Icon } from "@iconify/react";
import { usePathname, useRouter } from "next/navigation";
import { useMediaQuery } from "usehooks-ts";
import { StoreData } from "@/lib/actions/store";
import { SessionValidationResult } from "@/lib/actions/session";
import { useDelivery } from "@/components/providers/delivery-provider";
import { cn } from "@heroui/react";
import { pacifico } from "@/components/fonts";
import GradientText from "@/components/ui/gradient-text";
import LanguageModal from "@/components/language-modal";
import { useTranslations } from "next-intl";
import ProfilePopover from "@/components/navbar/profile/profile-popover";
import { logger } from "@/lib/logger";
import { useCart } from "@/components/providers/cart-provider";
import Image from "next/image";
import { DeliveryNavbar } from "./DeliveryNavbar";
import { FilterButton } from "@/components/store/filter/FilterButton";
interface NavbarTranslationProps {
    t: (key: string) => string;
}

interface DefaultNavbarProps extends NavbarTranslationProps {
    store?: StoreData;
    session: SessionValidationResult;
    navigateToStore: () => void;
}

export const DefaultNavbar: React.FC<DefaultNavbarProps> = ({
    store,
    session,
    navigateToStore
}) => {
    const [isLanguageOpen, setIsLanguageOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const isHideDelivery = useMediaQuery(store ? "(max-width: 1200px)" : "(max-width: 948px)");
    const router = useRouter();
    const { isDelivery, toggleDeliveryMode, isTogglingDelivery } = useDelivery();
    const { setCurrentCartType } = store ? useCart() : { setCurrentCartType: () => {} };
    const t = useTranslations("app/(store)/components/store-header");
    const pathname = usePathname();

    let deliveryOption = store?.deliveryOption || "undefined";

    if (deliveryOption === "undefined") {
        deliveryOption = "multi";
    }

    
    const isProductPage = pathname.includes("item");
    const isSearchPage = pathname.includes("settings");
    const isOrdersPage = pathname.includes("orders");

    const handleBack = () => {
        if (isProductPage || isOrdersPage || isSearchPage) {
            router.push(`/${store?.storeName}`);
        } else {
            router.push("/search");
        }
    }

    return (
        <>
            <NavbarBrand className="flex items-center space-x-3 sm:space-x-8">
                    {store ? (
                        <>
                        <Button
                        size="md"
                            variant="flat"
                            className="text-foreground"
                            onPress={handleBack}
                            isIconOnly
                        >
                            <Icon
                                height={24}
                                icon="solar:alt-arrow-left-linear"
                                width={24}
                            />
                    </Button>
                    {!isMobile && (
                        <div className="flex items-center gap-2 cursor-pointer" onClick={navigateToStore}>
                            <GradientText className={cn("text-xl md:text-2xl font-medium", pacifico.className)}>
                                {store.ownerName}
                            </GradientText>
                        </div>
                    )}
                    </>
                ) : (
                    <div className="flex items-center cursor-pointer" onClick={() => router.push("/")}>
                        <a
                            className="flex items-center justify-end w-8 h-8"
                            href="/"
                        >
                            <Image
                                src="/images/TheBakerzLogo.svg"
                                width={32}
                                height={32}
                                alt={"TheBakerz Logo"}
                            />
                            {/* <span className={`text-2xl ml-2 ${pacifico.className}`}>TheBakerz</span> */}
                        </a>
                    </div>
                )}
                {/* Toggle Delivery Button */}
                <div className="flex items-center justify-start py-4">
                    <div className="relative rounded-xl p-0.5 bg-background">
                        <ButtonGroup
                            isIconOnly
                            className="relative z-10 overflow-hidden"
                            isDisabled={isTogglingDelivery}
                        >
                             {(deliveryOption === "delivery" || deliveryOption === "multi") && (
                                <Button
                                    disableRipple
                                    onPress={() => {
                                        setCurrentCartType('delivery');
                                        toggleDeliveryMode(true);
                                    }}
                                    className={cn(
                                        "min-w-24 transition-all duration-300 data-[hover=true]:bg-transparent",
                                        isDelivery ? "text-foreground-secondary font-medium" : "text-default-500 font-normal",
                                        isTogglingDelivery ? "opacity-50" : "opacity-100"
                                    )}
                                    variant="light"
                                    isDisabled={isTogglingDelivery}
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
                                        <span className={cn("text-sm", isDelivery ? "text-foreground-secondary" : "text-default-500")}>{t('delivery')}</span>
                                    </div>
                                </Button>
                            )}
                            {(deliveryOption === "pickup" || deliveryOption === 'multi') && (
                                <Button
                                    disableRipple
                                    onPress={() => {
                                        setCurrentCartType('pickup');
                                        toggleDeliveryMode(false);
                                    }}
                                    isIconOnly
                                    className={cn(
                                        "min-w-24 transition-all duration-300 data-[hover=true]:bg-transparent",
                                        !isDelivery ? "text-foreground-secondary font-medium" : "text-default-500 font-normal",
                                        isTogglingDelivery ? "opacity-50" : "opacity-100"
                                    )}
                                    variant="light"
                                    isDisabled={isTogglingDelivery}
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
                                        <span className={cn("text-sm", isDelivery ? "text-default-500" : "text-foreground-secondary")}>{t('pickup')}</span>
                                    </div>
                                </Button>
                            )}
                        </ButtonGroup>
                        <div
                            className={cn(
                                "absolute top-1 bottom-1 rounded-full bg-white dark:bg-default-700 transition-all duration-300",
                                !isDelivery ? "translate-x-[calc(100%)]" : "translate-x-[1px]",
                                (deliveryOption === "multi") ? "w-[calc(50%)]" : "w-[calc(100%)]",
                                (deliveryOption === "pickup") && "translate-x-[1px]"
                            )}
                            style={{
                                left: deliveryOption === "pickup" ? "1px" : 0
                            }}
                        />
                    </div>
                </div>
                <div>
                    <FilterButton />
                </div>
                {!isHideDelivery && (
                    <DeliveryNavbar
                        isVisible={true}
                        level="top-0"
                        isComponent={true}
                    />
                )}
            </NavbarBrand>

            <NavbarContent className="flex flex-row-reverse gap-4 justify-end">
                <ProfilePopover
                    session={session}
                    trigger={
                        <Avatar 
                            isBordered
                            size="sm"
                            src={session?.user?.picture || "/profile/profile_1.png"} 
                            name={session?.user?.username || "User"}
                            color="primary"
                            classNames={{
                                base: "bg-white"
                            }}
                            className="cursor-pointer"
                        />
                    }
                />
                {/* <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    className="min-w-0"
                    onPress={() => setIsLanguageOpen(true)}
                >
                    <Icon icon="material-symbols-light:language" width={32} height={32} />
                </Button> */}
            </NavbarContent>
            {isLanguageOpen && <LanguageModal handAction={() => setIsLanguageOpen(false)}/>}
        </>
    );
}; 