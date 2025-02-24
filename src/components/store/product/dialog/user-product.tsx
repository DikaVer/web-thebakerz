'use client';
import React, { useState} from "react";
import {
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Image,
    Card,
    Textarea,
    cn,
    CardFooter,
    ScrollShadow
} from "@heroui/react";
import { ProductData } from "@/lib/actions/product";
import { formatCurrency } from "@/lib/utils";
import { IconCopy } from "@/components/ui/icons";
import { useTheme } from "next-themes";
import { CopyText } from "@/components/ui/copy-text";
import { InputStepper } from "@/components/store/product/dialog/button-stepper";
import { ItemCart } from "@/lib/actions/cart";
import { updateCart } from "@/lib/actions/cart";
import showErrorMessage from "@/components/toast/toast-error";
import showSuccessMessage from "@/components/toast/toast-succes";
import {useProductDialog} from "@/components/providers/product-provider";

type ProductDialogProps = {
    productData: ProductData;
    onClose: () => void;
    itemCart?: ItemCart;
};

export default function UserProductDialog({
                                              productData,
                                              onClose,
                                              itemCart,
                                          }: ProductDialogProps) {
    const { theme } = useTheme();

    const [charCount, setCharCount] = useState(itemCart?.note.length || 0);
    const [quantity, setQuantity] = useState(itemCart?.quantity || 1);
    const totalPrice = formatCurrency((productData?.price || 1) * quantity);
    const [note, setNote] = useState(itemCart?.note || "");
    const [isLoading, setIsLoading] = useState(false);
    const { addItem, updateItem } = useProductDialog();


    // This function calls the updateCart server action.
    const handleUpdateCart = async () => {
        setIsLoading(true);
        try {
            if (!itemCart){// Call our server action to update (or add) the cart item.
                // We pass productData.id as product_id, productData.store_id as store_id, and the note and quantity.
                const result = await updateCart(productData.id, productData.store_id, note, quantity);
                if (result.success) {
                    showSuccessMessage({success: result.success});
                    result.itemCart && addItem(result.itemCart);
                    onClose();
                } else if (result.error) {
                    showErrorMessage({error: result.error});
                }
            } else {
                await updateItem({...itemCart, note, quantity});
                onClose();
            }
        } catch (error: any) {
            showErrorMessage({ error: "Unexpected error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <ModalHeader className="flex flex-col gap-1 p-1">
                <CopyText
                    onClose={onClose}
                    isIconOnly={true}
                    copyText={
                        "https://www.thebakerz.com/" +
                        productData?.store_id +
                        "?product=" +
                        productData?.id
                    }
                    textNotify={"Product Link Copied!"}
                >
                    <IconCopy
                        size={28}
                        primaryColor={`${theme === 'light' ? '#730c70' : '#faf4d1'}`}
                        secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#a3a3a3'}`}
                    />
                </CopyText>
            </ModalHeader>
            <ModalBody className={"p-0"}>
                {productData && (
                    <>
                        <ScrollShadow className={"max-h-[70vh]"} size={100}>
                        <Card
                            isFooterBlurred
                            radius="lg"
                            className={`border-none shadow-none rounded-none`}
                        >
                            <Image
                                removeWrapper
                                alt={productData.name}
                                className="object-cover"
                                src={productData.picture}
                            />
                            <CardFooter
                                className={`text-black justify-between items-end bg-white/40 border-white/20 border-1  overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10`}
                            >
                                <p className={`w-full text-xl sm:text-2xl truncate mr-6 font-medium`}>
                                    {productData.name}
                                </p>
                                <p className={`text-lg cm:text-xl font-light`}>
                                    {formatCurrency(productData.price)}
                                </p>
                            </CardFooter>
                        </Card>
                            <div className={"flex flex-col px-2 py-2 text-default-400 gap-4"}>
                                <p>{productData.description}</p>
                                <Textarea
                                    label={"Notes"}
                                    labelPlacement={"outside"}
                                    placeholder={`Add notes to your order... (max 100 characters)`}
                                    style={{ resize: "none" }}
                                    className="mt-2"
                                    classNames={{
                                        input: cn("min-h-[40px]"),
                                    }}
                                    value={note}
                                    minRows={4}
                                    maxRows={5}
                                    onValueChange={(value) => {
                                        setNote(value);
                                        setCharCount(value.length);
                                    }}
                                    isInvalid={charCount > 100}
                                />
                                <p className="text-right text-grayText text-small px-2">
                                    {charCount}/100
                                </p>
                            </div>
                        </ScrollShadow>
                    </>
                )}
            </ModalBody>
            <ModalFooter className={"px-4 space-x-4"}>
                <InputStepper
                    min={1}
                    max={999}
                    value={quantity}
                    onChange={setQuantity}
                />
                <Button
                    className={"w-full"}
                    color="primary"
                    onPress={handleUpdateCart}
                    isLoading={isLoading}
                >
                    { !isLoading ? (`${itemCart ? "Update" : "Add"} ${quantity} to order • ${totalPrice}`) : "Updating cart..."}
                </Button>
            </ModalFooter>
        </>
    );
}
