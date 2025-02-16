"use client";
import { Icon } from "@iconify/react";
import { Badge } from "@heroui/badge";
import React, { useState } from "react";
import {
    Button,
    Divider,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    Image,
    Spacer,
    useDisclosure,
} from "@heroui/react";
import { useMediaQuery } from "usehooks-ts";
import { useProductDialog } from "@/components/providers/product-provider";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { InputStepper } from "@/components/store/product/dialog/button-stepper";
import {ItemCart} from "@/lib/actions/cart";
import {ProductData} from "@/lib/actions/product";

// Define a separate component for each cart item row.
type CartItemRowProps = {
    item: ItemCart;
    productData: ProductData;
    updateItem: (item: ItemCart) => void;
    removeItem: (item: ItemCart) => void;
};

const CartItemRow: React.FC<CartItemRowProps> = ({
                                                     item,
                                                     productData,
                                                     updateItem,
                                                     removeItem,
                                                 }) => {
    const [quantity, setQuantity] = useState<number>(item.quantity);

    const handleQuantityChange = (value: number) => {
        setQuantity(value);
        if (value === 0) {
            removeItem(item);
        } else {
            updateItem({ ...item, quantity: value });
        }
    };

    // Hide the row if quantity is zero.
    if (quantity === 0) return null;

    return (
        <div
            key={item.id}
            className="flex gap-4 p-4 border-b border-gray-200"
        >
            <div className="w-20 h-20">
                <Image
                    removeWrapper
                    alt={productData.name}
                    src={productData.picture}
                    className="object-cover w-full h-full"
                />
            </div>
            <div className="flex w-full justify-between">
                <div className="flex flex-col">
                    <p className="font-medium">{productData.name}</p>
                    <Spacer y={4} />
                    {item.note && (
                        <p className="text-sm text-gray-600">Note: {item.note}</p>
                    )}
                </div>
                <div className="flex items-center justify-end">
                    <InputStepper
                        isCart
                        min={0}
                        max={999}
                        value={quantity}
                        onChange={handleQuantityChange}
                    />
                </div>
            </div>
        </div>
    );
};

const CartButton: React.FC<{ ownerName?: string }> = ({ ownerName }) => {
    const { itemCount, cart, getProductDataById, updateItem, removeItem } =
        useProductDialog();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const isMobile = useMediaQuery("(max-width: 768px)");

    const handleOpen = () => {
        onOpen();
    };

    // Render cart items by flattening all items and mapping to CartItemRow components.
    const renderCartItems = () => {
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
                />
            );
        });
    };

    return (
        <>
            <Button isIconOnly variant="light" onPress={handleOpen}>
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
                            <DrawerHeader className="flex flex-col">
                                {!isMobile && <Spacer y={16} />}
                                <p className="text-default-500 text-xs font-medium">
                                    Your cart from
                                </p>
                                <p className="text-xl">{ownerName}</p>
                                <Spacer y={4} />
                                <Button className="w-full bg-gradient-primary text-2xl rounded-full text-white">
                                    Continue
                                </Button>
                            </DrawerHeader>
                            <DrawerBody>
                                <ScrollShadow className="max-h-full">
                                    <Divider />
                                    {renderCartItems()}
                                </ScrollShadow>
                            </DrawerBody>
                            {/* Optionally add a DrawerFooter */}
                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default CartButton;
