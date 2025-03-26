"use client";
import { Icon } from "@iconify/react";
import React, {useEffect, useState} from "react";
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
import {AnimatePresence, motion, useAnimation} from "framer-motion";

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
    const t = useTranslations("app/(store)/components/cart");
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

    const controls = useAnimation();

    useEffect(() => {
        // Animate when itemCount changes
        controls.start({
            scale: [1, 1.15, 1],
            transition: {
                duration: 0.5,
                times: [0, 0.2, 1],
                ease: "easeInOut"
            }
        });
    }, [itemCount, controls]);

    return (
        <>
            <motion.div animate={controls}>
                <Badge
                    color="secondary"
                    content={
                        <AnimatePresence
                            mode="wait"
                        >
                            <motion.span
                                key={itemCount}
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                transition={{ duration: 0.2 }}
                            >
                                {itemCount > 99 ? "99+" : itemCount}
                            </motion.span>
                        </AnimatePresence>
                    }
                    isInvisible={itemCount === 0}
                    className={'w-7 aspect-square'}
                    classNames={{
                        badge: "border-text",
                    }}
                    shape="circle"
                >
                    <Button
                        isIconOnly
                        radius={'full'}
                        color={'primary'}
                        className={'bg-gradient-primary'}
                        onPress={handleOpenDrawer}
                    >
                        <Icon
                            icon={"solar:cart-large-2-bold"}
                            height={24}
                            width={24}
                            className="text-white"
                        />
                    </Button>
                </Badge>
            </motion.div>
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
                                            {t("yourCartFrom")}
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
                                            {t("continue")}
                                        </Button>
                                    </DrawerHeader>
                                    <DrawerBody>
                                        <ScrollShadow className="max-h-full" hideScrollBar>
                                            <Divider />
                                            {renderCartItems(isLoading, setIsLoading)}
                                        </ScrollShadow>
                                    </DrawerBody>
                                </>
                            ) : (
                                <DrawerHeader className="flex flex-col text-xs font-medium items-center">
                                    {!isMobile && <Spacer y={16} />}
                                    <p>{t("cartEmpty")}</p>
                                    <p>{t("addItemsToStart")}</p>
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