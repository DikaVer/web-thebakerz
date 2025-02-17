"use client";
import { Icon } from "@iconify/react";
import { Badge } from "@heroui/badge";
import React, { useState} from "react";
import {
    Button,
    Divider,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerHeader,
    Spacer,
    useDisclosure,
} from "@heroui/react";
import { useMediaQuery } from "usehooks-ts";
import { useProductDialog } from "@/components/providers/product-provider";
import { ScrollShadow } from "@heroui/scroll-shadow";
import {useRouter} from "next/navigation";
import {useStore} from "@/components/providers/store-provider";
import {CartItemRow} from "@/components/cart/cart-item";


const CartButton: React.FC = () => {
    const {
        itemCount,
        cart,
        getProductDataById,
        updateItem,
        removeItem,
        handleOpen
    } = useProductDialog();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [isLoading, setIsLoading] = useState(false);
    const { store } = useStore();
    const router = useRouter();

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
            <Button isIconOnly variant="light" onPress={handleOpenDrawer}>
                <Badge
                    color="primary"
                    content={itemCount > 99 ? "99+" : itemCount}
                    isInvisible={itemCount === 0}
                    shape="circle"
                >
                    <Icon
                        icon={"solar:cart-large-minimalistic-broken"}
                        height={24}
                        width={24}
                        className="text-default-500"
                    />
                </Badge>
            </Button>
            <Drawer
                isOpen={isOpen}
                placement={isMobile ? "bottom" : "right"}
                onOpenChange={onOpenChange}
                backdrop="blur"
            >
                <DrawerContent>
                    {(onClose) => (
                        <>
                            {itemCount > 0 ? (
                                <>
                                    <DrawerHeader className="flex flex-col">
                                        {!isMobile && <Spacer y={16} />}
                                        <p className="text-default-500 text-xs font-medium">
                                            Your cart from
                                        </p>
                                        <p className="text-xl">{store.ownerName}</p>
                                        <Spacer y={4} />
                                        <Button
                                            isLoading={isLoading}
                                            className="w-full bg-gradient-primary text-2xl rounded-full text-white"
                                            onPress={() => {
                                                setIsLoading(true);
                                                router.push(`${store.storeName}/checkout`);
                                                router.refresh();
                                            }}
                                        >
                                            Continue
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
                                    <p>Your cart is empty</p>
                                    <p>Add items to get started</p>
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
