"use client";
import { Icon } from "@iconify/react";
import { Badge } from "@heroui/badge";
import React, {useEffect, useState} from "react";
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
import { ProductData } from "@/lib/actions/product";
import { ItemCart } from "@/lib/actions/cart";
import {formatCurrency} from "@/lib/utils";
import {useRouter} from "next/navigation";

type CartItemRowProps = {
    item: ItemCart;
    productData: ProductData;
    updateItem: (item: ItemCart) => Promise<void>;
    removeItem: (item: ItemCart) => Promise<void>;
    isLoading: boolean;
    setIsLoading: (value: boolean) => void
    handleOpen: (productId?: string, itemCart?: ItemCart) => void;
};

const CartItemRow: React.FC<CartItemRowProps> = ({
                                                     item,
                                                     productData,
                                                     updateItem,
                                                     removeItem,
    isLoading,
    setIsLoading,
    handleOpen
                                                 }) => {

    const handleQuantityChange = async (value: number) => {
        if (value === 0) {
            await removeItem(item);
        } else {
            await updateItem({ ...item, quantity: value });
        }
    };

    if (item.quantity === 0) return null;

    return (
        <>
            <div
                className="flex gap-4 p-4  rounded-xl hover:bg-default-100 cursor-pointer border-gray-200"
                key={item.id}

                onClick={() => handleOpen(productData.id, item)}
            >
                <div className="w-20 h-20 aspect-square">
                    <Image
                        removeWrapper
                        alt={productData.name}
                        src={productData.picture}
                        className="object-cover w-full h-full"
                    />
                </div>
                <div className="flex w-full justify-between">
                    <div className="flex flex-col">
                        <p className="font-medium truncate max-w-[130px]">{productData.name}</p>
                        {item.note ? (<>
                            <p className="text-sm text-gray-600">{item.note && "Note*"}</p>
                            <Spacer y={4}/>
                        </>) : (
                            <Spacer y={8}/>
                        )}
                        <p className="text-sm text-gray-600">
                            {formatCurrency(productData.price * item.quantity)}
                        </p>
                    </div>
                    <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                        <InputStepper
                            isCart
                            min={0}
                            max={999}
                            value={item.quantity}
                            onChange={handleQuantityChange}
                            isLoading={isLoading}
                            setIsLoading={setIsLoading}
                        />
                    </div>
                </div>
            </div>
            <Divider/>
        </>
    );
};

const CartButton: React.FC<{ ownerName?: string }> = ({ ownerName }) => {
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
                                        <p className="text-xl">{ownerName}</p>
                                        <Spacer y={4} />
                                        <Button
                                            isLoading={isLoading}
                                            className="w-full bg-gradient-primary text-2xl rounded-full text-white"
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
