/**
 * @fileoverview Simplified navigation bar for return-style pages such as checkout.
 *
 * Exports the ReturnNavbar component, which shows a back button that returns
 * to the store, the previous page, or home depending on context, alongside
 * either the store owner name, the TheBakerz brand text, a cart button, or a
 * join button on the become-partner page.
 */
import { Button, NavbarItem, Avatar, Image, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter, usePathname } from "next/navigation";
import { StoreData } from "@/lib/actions/store";
import { SessionValidationResult } from "@/lib/actions/session";
import { JoinButton } from "@/components/ui/join-button";
import CartButton from "@/components/cart/cart-button";
import GradientText from "@/components/ui/gradient-text";
import { pacifico } from "@/components/fonts";
import { useTranslations } from "next-intl";


interface ReturnNavbarProps {
    store?: StoreData;
    navigateToStore: () => void;
    isVisibleCart?: boolean;
    session: SessionValidationResult;
}

export const ReturnNavbar: React.FC<ReturnNavbarProps> = ({
    store,
    navigateToStore,
    isVisibleCart,
    session
}) => {

    const t = useTranslations("app/(landing)/components/navbar");
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
                    aria-label="Go back to store"
                    size="md"
                    variant="flat"
                    isIconOnly
                    className="text-foreground"
                    onPress={redirectToStore}
                >
                    <Icon
                            height={24}
                            icon="solar:alt-arrow-left-linear"
                            width={24}
                        />
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