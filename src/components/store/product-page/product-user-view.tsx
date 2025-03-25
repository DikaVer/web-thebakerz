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
import { ItemCart, Variant } from "@/lib/actions/cart";
import { updateCart } from "@/lib/actions/cart";
import showErrorMessage from "@/components/toast/toast-error";
import showSuccessMessage from "@/components/toast/toast-succes";
import {useProductDialog} from "@/components/providers/product-provider";
import CustomAlert from "@/components/ui/custom-alerts";
import {Icon} from "@iconify/react";
import {useMediaQuery} from "usehooks-ts";
import {AllergenIcon} from "@/components/store/product/components/allergy-icons";
import {useCart} from "@/components/providers/cart-provider";
import {useTranslations} from "next-intl";
import VariantsUserSelection from "@/components/store/product/components/variants-user-selection";

type ProductViewProps = {
    productData: ProductData;
};

export default function UserProductView({
                                              productData
                                          }: ProductViewProps) {
    const t = useTranslations("TheBakerz");
    const allergy = useTranslations("Allergies");

    const [charCount, setCharCount] = useState(0);
    const [quantity, setQuantity] = useState(productData?.min_order || 1);
    const [note, setNote] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [variants, setVariants] = useState<Variant[]>([]);
    const totalPrice = formatCurrency(((productData?.price || 1) + variants.reduce((sum, variant) => sum + (variant?.selectedItems ? variant.selectedItems.reduce((itemSum, item) => itemSum + (item.price || 0), 0) : 0), 0)) * quantity);
    // Add state to track the current main image
    const [mainImage, setMainImage] = useState(productData.picture);


    // Function to handle image swapping
    const handleImageSwap = (additionalImage: string) => {
        // Set the clicked additional image as the main image
        setMainImage(additionalImage);
    };

    const {
        addItem,
        onOpen
    } = useCart();
    const isSmall = useMediaQuery("(max-width: 484px)");



    // This function calls the updateCart server action.
    const handleUpdateCart = async () => {
        setIsLoading(true);
        try {
            // We pass productData.id as product_id, productData.store_id as store_id, and the note and quantity.
            const result = await updateCart(productData.id, productData.store_id, quantity, note, variants);
            if (result.success) {
                showSuccessMessage({success: t("Cart updated successfully")});
                result.itemCart && addItem(result.itemCart);
                onOpen();
            } else if (result.error) {
                showErrorMessage({ error: result.error });
            }
        } catch (error: any) {
            showErrorMessage({ error: t("Unexpected Error") });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Card
                className={'w-full max-w-full md:max-w-3xl'}
            >
                <CardBody className={"p-0 py-4 justify-center items-center"}>
                    {productData && (
                        <div className={" md:flex  w-full gap-x-4"} >
                            <div>
                                <div className={cn('w-full md:w-[258px] aspect-square',
                                    isSmall ? "max-w-full" : "max-w-[400px]"
                                )}>
                                    <Card
                                        isFooterBlurred
                                        className={cn(`flex w-full justify-start items-start shadow-none rounded-none ml-4`,
                                            isSmall ? "ml-0" : "ml-4"
                                        )}
                                    >

                                        {/* Display the current main image instead of productData.picture */}
                                        <Image
                                            removeWrapper
                                            alt={productData.name}
                                            radius={'none'}
                                            className={cn("w-full",
                                                isSmall ? "rounded-none border-none" : "rounded-xl"
                                            )}
                                            src={mainImage}
                                        />
                                        <CardFooter
                                            className={cn(`text-black justify-between items-end bg-white/40 border-white/20 border-1  overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 shadow-small ml-1 z-10`,
                                                isSmall ? "w-[calc(100%_-_16px)]" : "w-[calc(100%_-_8px)]"
                                            )}
                                        >
                                            <p className={`w-full text-xl truncate mr-6 font-medium`}>
                                                {productData.name}
                                            </p>
                                            <p className={`text-lg cm:text-xl font-light`}>
                                                {formatCurrency(productData.price)}
                                            </p>
                                        </CardFooter>

                                    </Card>
                                </div>
                                <div className="flex flex-row gap-2 mt-2 justify-start w-full px-4">
                                    {/* Map through additional images */}
                                    {(productData.additionalImages && productData.additionalImages.length > 0) &&
                                        (
                                            <>
                                                <div
                                                    className={cn(
                                                        "relative flex justify-center items-center w-20 h-20 opacity-50 cursor-pointer border-1",
                                                        "rounded-lg",
                                                        mainImage === productData.picture && 'opacity-100'
                                                    )}
                                                    onClick={() => setMainImage(productData.picture)}
                                                >
                                                    <Image
                                                        removeWrapper
                                                        alt="Main product image"
                                                        className={cn("object-cover w-full h-full", "rounded-lg")}
                                                        src={productData.picture}
                                                    />
                                                </div>
                                                {productData.additionalImages.map((img, index) => (
                                                        <div
                                                            key={index}
                                                            className={cn(
                                                                "relative flex justify-center items-center w-20 h-20 opacity-50 cursor-pointer border-1",
                                                                "rounded-lg",
                                                                mainImage === img && 'opacity-100'
                                                            )}
                                                            onClick={() => handleImageSwap(img)}
                                                        >
                                                            <Image
                                                                removeWrapper
                                                                alt={`Additional image ${index + 1}`}
                                                                className={cn("object-cover w-full h-full ", "rounded-lg")}
                                                                src={img}
                                                            />
                                                        </div>
                                                    )
                                                )}
                                            </>
                                        )}
                                </div>
                            </div>

                            {/*{isSmall && (*/}
                            <div className={"flex flex-col px-4 py-4 w-full text-default-400 gap-4"}>
                                <p className={'font-light text-sm'}>{productData.description}</p>
                                {/* Ingredients Alert: Default variant */}
                                {productData.ingredients && productData.ingredients.length > 0 && (
                                    <CustomAlert
                                        color="default"
                                        title={t("Ingredients")}
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
                                    <CustomAlert color="warning" title={t("Allergies")} hideIcon>
                                        <div className="flex flex-wrap gap-2 mt-4">

                                            {productData.allergies.map((allergies, index) => {
                                                return (
                                                    <div
                                                        key={allergies}
                                                        className={`flex items-center gap-1 px-2 py-1 text-sm rounded-full text-warning-800 bg-warning-200`}
                                                    >
                                                        <AllergenIcon allergen={allergies} />
                                                        <span>
                                                                {allergy(allergies)}
                                                            </span>

                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CustomAlert>
                                )}

                                <VariantsUserSelection
                                    productData={productData}
                                    variants={variants}
                                    setVariants={setVariants}
                                />


                                <Textarea
                                    label={t("Notes")}
                                    labelPlacement={"outside"}
                                    placeholder={t("Add Notes Placeholder")}
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
                        </div>
                    )}
                </CardBody>
                <CardFooter className={"px-4 space-x-4"}>
                    <InputStepper
                        min={productData?.min_order || 1}
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
                        { !isLoading ? (`${t("Add")} ${quantity} ${t("to order")} • ${totalPrice}`) : t("Updating Cart") }
                    </Button>
                </CardFooter>
            </Card>
        </>
    );
}