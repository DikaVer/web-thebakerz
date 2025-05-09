import { useState } from "react";
import { Button, NavbarBrand, NavbarContent, NavbarItem, Avatar, Image, ButtonGroup } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "usehooks-ts";
import { StoreData } from "@/lib/actions/store";
import { SessionValidationResult } from "@/lib/actions/session";
import { SigninButton } from "@/components/ui/signin-button";
import { useDelivery } from "@/components/providers/delivery-provider";
import { cn } from "@heroui/react";
import { pacifico } from "@/components/fonts";
import GradientText from "@/components/ui/gradient-text";
import LanguageModal from "@/components/language-modal";
import CartButton from "@/components/cart/cart-button";
import { useTranslations } from "next-intl";
import ProfilePopover from "@/components/navbar/profile/profile-popover";

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
    navigateToStore,
    t
}) => {
    const [isLanguageOpen, setIsLanguageOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const router = useRouter();
    const { isDelivery, toggleDeliveryMode, isTogglingDelivery, isSubheaderLoaded } = useDelivery();
    const cT = useTranslations("app/(store)/components/store-header");

    return (
        <>
            <NavbarBrand className="flex items-center gap-3">
                    {store ? (
                        <>
                        <Button
                        size="md"
                        variant="flat"
                        className="text-foreground"
                        //Use back if no back, then push to "/"
                        onPress={() => {
                                // Check if coming from a transit-exit page
                                router.push("/");
                        }}
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
                        <GradientText className={cn("text-xl md:text-2xl font-medium ml-2", pacifico.className)}>
                            TheBakerz
                        </GradientText>
                    </div>
                )}
                <div className="flex items-center justify-start w-full py-4">
                    <div className="relative p-1 rounded-xl bg-background">
                        <ButtonGroup
                            isIconOnly
                            className="relative z-10 overflow-hidden"
                            isDisabled={isTogglingDelivery || !isSubheaderLoaded}
                        >
                            <Button
                                disableRipple
                                onPress={() => toggleDeliveryMode(false)}
                                isIconOnly
                                className={cn(
                                    "md:min-w-32 transition-all duration-300 data-[hover=true]:bg-transparent",
                                    !isDelivery ? "text-foreground-secondary font-medium" : "text-default-500 font-normal",
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
                                    <span className={cn("text-sm hidden md:block", isDelivery ? "text-default-500" : "text-foreground-secondary")}>{cT('pickup')}</span>
                                </div>
                            </Button>
                            <Button
                                disableRipple
                                onPress={() => toggleDeliveryMode(true)}
                                className={cn(
                                    "md:min-w-32 transition-all duration-300 data-[hover=true]:bg-transparent",
                                    isDelivery ? "text-foreground-secondary font-medium" : "text-default-500 font-normal",
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
                                    <span className={cn("text-sm hidden md:block", isDelivery ? "text-foreground-secondary" : "text-default-500")}>{cT('delivery')}</span>
                                </div>
                            </Button>
                        </ButtonGroup>
                        <div
                            className={cn(
                                "absolute top-1 bottom-1 w-[calc(50%)] rounded-full bg-white dark:bg-default-700 transition-all duration-300",
                                isDelivery ? "translate-x-[calc(100%)]" : "translate-x-[1px]"
                            )}
                            style={{
                                left: 0
                            }}
                        />
                    </div>
                </div>
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
                {(store && !isMobile && session?.user?.id !== store?.user_id) && (
                    <CartButton />
                )}
                <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    className="min-w-0"
                    onPress={() => setIsLanguageOpen(true)}
                >
                    <Icon icon="material-symbols-light:language" width={32} height={32} />
                </Button>
            </NavbarContent>
            {isLanguageOpen && <LanguageModal handAction={() => setIsLanguageOpen(false)}/>}
        </>
    );
}; 