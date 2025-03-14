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
    ScrollShadow, CardBody
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
import CustomAlert from "@/components/ui/custom-alerts";
import {Icon} from "@iconify/react";
import {useMediaQuery} from "usehooks-ts";
import {AllergenIcon} from "@/components/store/product/components/allergy-icons";
import {useCart} from "@/components/providers/cart-provider";

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

    const {
        addItem,
        updateItem,
    } = useCart();
    const isSmall = useMediaQuery("(max-width: 416px)");
    


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
            <ModalHeader className={'px-4 justify-between'}>

                <Button isIconOnly variant={'light'} radius={'full'} onPress={onClose}>
                    <Icon icon="iconamoon:close-bold" width={32} className="text-default-400" strokeWidth={2} stroke={"2"}/>
                </Button>
                <CopyText
                    onClose={onClose}
                    isIconOnly={true}
                    copyText={
                        process.env.NEXT_PUBLIC_API_BASE_URL + "/" +
                        productData?.store_id +
                        "?product=" +
                        productData?.id
                    }
                    textNotify={"Product Link Copied!"}
                >
                    <Icon icon="mi:share" width={32} className="text-default-400" strokeWidth={2} stroke={"2"}/>
                </CopyText>
            </ModalHeader>
            <ModalBody className={"p-0 justify-center items-center"}>
                {productData && (
                    <ScrollShadow className={" md:flex  max-h-[80svh] w-full gap-x-4"} size={0}>
                        <div className={'md:w-[258px] w-full max-w-[400px]'}>
                            <Card
                                isFooterBlurred
                                className={`flex w-fit justify-start items-start shadow-none rounded-none md:ml-4`}
                            >
                                <div
                                    className={cn("relative flex flex-col justify-center items-center md:w-[258px] w-full max-w-[400px] aspect-square rounded-none",
                                    )}
                                >
                                    <Image
                                        removeWrapper
                                        alt={productData.name}
                                        radius={'none'}
                                        className={cn("w-full",
                                            isSmall ? "rounded-none border-none" : "rounded-xl"
                                        )}
                                        src={productData.picture}
                                    />
                                    <CardFooter
                                        className={`text-black justify-between items-end bg-white/40 border-white/20 border-1  overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10`}
                                    >
                                        <p className={`w-full text-xl truncate mr-6 font-medium`}>
                                            {productData.name}
                                        </p>
                                        <p className={`text-lg cm:text-xl font-light`}>
                                            {formatCurrency(productData.price)}
                                        </p>
                                    </CardFooter>
                                </div>
                            </Card>
                        </div>

                        {/*{isSmall && (*/}
                            <div className={"flex flex-col px-4 py-2 w-full text-default-400 gap-4"}>
                                <p className={'font-light text-sm'}>{productData.description}</p>
                                {/* Ingredients Alert: Default variant */}
                                {productData.ingredients && productData.ingredients.length > 0 && (
                                    <CustomAlert
                                        color="default"
                                        title="Ingredients"
                                        hideIcon
                                        classNames={{
                                            title: "text-text font-medium"
                                        }}
                                    >
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {productData.ingredients.map((ingredient, index) => {
                                                return (
                                                    <div
                                                    key={ingredient}
                                                    className={`flex items-center gap-2 px-2 py-1  text-sm rounded-full text-text bg-default-200`}
                                                    >
                                                        <AllergenIcon allergen={ingredient} />
                                                        <span>
                                                            {ingredient}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CustomAlert>
                                )}
                                {/* Allergies Alert: Warning variant */}
                                {productData.allergies && productData.allergies.length > 0 && (
                                    <CustomAlert color="warning" title="Allergies" hideIcon>
                                        <div className="flex flex-wrap gap-2 mt-4">

                                            {productData.allergies.map((allergies, index) => {
                                                return (
                                                    <div
                                                        key={allergies}
                                                        className={`flex items-center gap-1 px-2 py-1 text-sm rounded-full text-warning-800 bg-warning-200`}
                                                    >
                                                        <AllergenIcon allergen={allergies} />
                                                        <span>
                                                            {allergies}
                                                        </span>

                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CustomAlert>
                                )}
                                <Textarea
                                    label={"Notes"}
                                    labelPlacement={"outside"}
                                    placeholder={`Add notes to your order... (max 100 characters)`}
                                    style={{resize: "none"}}
                                    className="mt-2"
                                    classNames={{
                                        input: cn("min-h-[40px] "),
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
