import { useState } from "react";
import { Button, Avatar, NavbarItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { usePathname, useRouter } from "next/navigation";
import { useMediaQuery } from "usehooks-ts";
import { StoreData } from "@/lib/actions/store";
import { SessionValidationResult } from "@/lib/actions/session";
import { cn } from "@heroui/react";
import { pacifico } from "@/components/fonts";
import GradientText from "@/components/ui/gradient-text";
import LanguageModal from "@/components/language-modal";
import ProfilePopover from "@/components/navbar/profile/profile-popover";
import Image from "next/image";
import { DeliveryNavbar } from "./DeliveryNavbar";


interface DefaultNavbarProps {
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
            router.push(`/${store?.storeName || store?.id}`);
        } else {
            router.push("/search");
        }
    }

    return (
        <>
            <NavbarItem className="flex items-center space-x-3 sm:space-x-8">
                    {store ? (
                        <>
                        <Button
                            aria-label="Go back"
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
                {/* Only show DeliveryNavbar on larger screens and hide on mobile */}
                {!isHideDelivery && (
                    <DeliveryNavbar
                        isVisible={true}
                        level="top-0"
                        isComponent={true}
                        store={store}
                    />
                )}
            </NavbarItem>

            <NavbarItem className="flex flex-row-reverse gap-4 justify-end">
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
                <Button
                    aria-label="Change language"
                    isIconOnly
                    variant="light"
                    size="sm"
                    className="min-w-0"
                    onPress={() => setIsLanguageOpen(true)}
                >
                    <Icon icon="material-symbols-light:language" width={32} height={32} />
                </Button>
            </NavbarItem>
            {isLanguageOpen && <LanguageModal handAction={() => setIsLanguageOpen(false)}/>}
        </>
    );
}; 