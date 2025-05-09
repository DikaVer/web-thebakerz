import { Button, NavbarItem, Avatar, Image, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter, usePathname } from "next/navigation";
import { StoreData } from "@/lib/actions/store";
import { SessionValidationResult } from "@/lib/actions/session";
import { JoinButton } from "@/components/ui/join-button";
import CartButton from "@/components/cart/cart-button";
import GradientText from "@/components/ui/gradient-text";
import { pacifico } from "@/components/fonts";

interface NavbarTranslationProps {
    t: (key: string) => string;
}

interface ReturnNavbarProps extends NavbarTranslationProps {
    store?: StoreData;
    navigateToStore: () => void;
    isVisibleCart?: boolean;
    session: SessionValidationResult;
}

export const ReturnNavbar: React.FC<ReturnNavbarProps> = ({
    store,
    navigateToStore,
    t,
    isVisibleCart,
    session
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const isPartnerPage = pathname.includes("/become-partner");
    
    const redirectToStore = () => {
        if (store) {
            navigateToStore();
        } else {
            if (isPartnerPage) {
                router.push("/");
            } else {
                router.back();
            }
        }
    }

    return (
        <>
            <NavbarItem className="ml-1 !flex">
                <Button
                    size="md"
                    variant="flat"
                    className="text-foreground"
                    onPress={redirectToStore}
                    startContent={
                        <Icon
                            height={24}
                            icon="solar:alt-arrow-left-linear"
                            width={24}
                        />
                    }
                >
                    {t("back")}
                </Button>
            </NavbarItem>
            <NavbarItem className="ml-1 !flex">
                {store ? !isVisibleCart ? (
                    <div className="flex items-center gap-2 cursor-pointer" onClick={navigateToStore}>
                        <GradientText className={cn("text-xl md:text-2xl font-medium", pacifico.className)}>
                            {store.ownerName}
                        </GradientText>
                    </div>
                ) : (session?.user && store?.user_id === session?.user.id) ? (
                    <div className="flex items-center cursor-pointer" onClick={() => router.push("/")}>
                        <GradientText className={cn("text-xl md:text-2xl font-medium ml-2", pacifico.className)}>
                            TheBakerz
                        </GradientText>
                    </div>
                ) : (
                    <CartButton />
                ) : isPartnerPage ? (
                    <JoinButton />
                ) : (
                    <div className="flex items-center cursor-pointer" onClick={() => router.push("/")}>
                        <GradientText className={cn("text-xl md:text-2xl font-medium ml-2", pacifico.className)}>
                            TheBakerz
                        </GradientText>
                    </div>
                )}
            </NavbarItem>
        </>
    );
}; 