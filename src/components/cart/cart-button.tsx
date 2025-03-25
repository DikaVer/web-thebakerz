"use client";
import { Icon } from "@iconify/react";
import React, { useState } from "react";
import {
    Button,
    Divider,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerHeader,
    Spacer,
    useDisclosure,
    Badge,
    ScrollShadow
} from "@heroui/react";
import { useMediaQuery } from "usehooks-ts";
import { useProductDialog } from "@/components/providers/product-provider";
import { useRouter } from "next/navigation";
import { useStore } from "@/components/providers/store-provider";
import { CartItemRow } from "@/components/cart/cart-item";
import { useCart } from "@/components/providers/cart-provider";
import { useTranslations } from "next-intl";

const CartButton: React.FC = () => {
    const {
        getProductDataById,
        handleOpen
    } = useProductDialog();

    const {
        isOpen,
        onOpen,
        onOpenChange,
        itemCount,
        cart,
        updateItem,
        removeItem,
    } = useCart();
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [isLoading, setIsLoading] = useState(false);
    const { store } = useStore();
    const router = useRouter();
    const t = useTranslations("TheBakerz");
    const storeUrl = store?.storeName ? store?.storeName : store?.id;

    const handleOpenDrawer = () => onOpen();

    const renderCartItems = (isLoading: boolean, setIsLoading: (value: boolean) => void) => {
        const itemsArray = Object.values(cart).flatMap(
            (storeCart) => Object.values(storeCart)
        );

        return itemsArray.map((item) => {
            const productData = getProductDataById(item.product_id);
            if (!productData) return null;
            return (
                <CartItemRow
                    key={item.id}
                    item={item}
                    productData={productData}
                    updateItem={updateItem}
                    removeItem={removeItem}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    handleOpen={handleOpen}
                />
            );
        });
    };

    return (
        <>
            <Badge
                color="secondary"
                content={itemCount > 99 ? "99+" : itemCount}
                isInvisible={itemCount === 0}
                classNames={{
                    badge: "border-text",
                }}
                shape="circle"
            >
                <Button isIconOnly radius={'full'} color={'primary'} className={'bg-gradient-primary'} onPress={handleOpenDrawer}>
                    <Icon
                        icon={"solar:cart-large-2-bold"}
                        height={24}
                        width={24}
                        className="text-white"
                    />
                </Button>
            </Badge>
            <Drawer
                isOpen={isOpen}
                placement={isMobile ? "bottom" : "right"}
                onOpenChange={onOpenChange}
                isDismissable={!isLoading}
                backdrop="blur"
                hideCloseButton={isLoading}
            >
                <DrawerContent>
                    {(onClose) => (
                        <>
                            {itemCount > 0 ? (
                                <>
                                    <DrawerHeader className="flex flex-col">
                                        {!isMobile && <Spacer y={16} />}
                                        <p className="text-default-500 text-xs font-medium">
                                            {t("Your cart from")}
                                        </p>
                                        <p className="text-xl">{store.ownerName}</p>
                                        <Spacer y={4} />
                                        <Button
                                            isLoading={isLoading}
                                            className="w-full bg-gradient-primary text-2xl rounded-full text-white"
                                            onPress={() => {
                                                setIsLoading(true);
                                                router.push(`${storeUrl}/checkout`);
                                                router.refresh();
                                            }}
                                        >
                                            {t("Continue")}
                                        </Button>
                                    </DrawerHeader>
                                    <DrawerBody>
                                        <ScrollShadow className="max-h-full">
                                            <Divider />
                                            {renderCartItems(isLoading, setIsLoading)}
                                        </ScrollShadow>
                                    </DrawerBody>
                                </>
                            ) : (
                                <DrawerHeader className="flex flex-col text-xs font-medium items-center">
                                    {!isMobile && <Spacer y={16} />}
                                    <p>{t("Cart Empty")}</p>
                                    <p>{t("Add Items To Start")}</p>
                                    <Spacer y={48} />
                                </DrawerHeader>
                            )}
                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default CartButton;