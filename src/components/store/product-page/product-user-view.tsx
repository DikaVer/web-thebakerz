'use client';
import React, { useState} from "react";
import {
    Button,
    Image,
    Card,
    Textarea,
    cn,
    CardFooter,
    CardBody
} from "@heroui/react";
import { ProductData } from "@/lib/actions/product";
import { formatCurrency } from "@/lib/utils";
import { InputStepper } from "@/components/store/product/dialog/button-stepper";
import { Variant } from "@/lib/actions/cart";
import { updateCart } from "@/lib/actions/cart";
import showErrorMessage from "@/components/toast/toast-error";
import showSuccessMessage from "@/components/toast/toast-succes";
import CustomAlert from "@/components/ui/custom-alerts";
import {useMediaQuery} from "usehooks-ts";
import {AllergenIcon} from "@/components/store/product/components/allergy-icons";
import {useCart} from "@/components/providers/cart-provider";
import {useTranslations} from "next-intl";
import VariantsUserSelection from "@/components/store/product/components/variants-user-selection";
import { Icon } from "@iconify/react/dist/iconify.js";

type ProductViewProps = {
    productData: ProductData;
};

export default function UserProductView({
    productData
}: ProductViewProps) {
    const c_T = useTranslations();
    const t = useTranslations("app/(store)/components/product-page");


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
                showSuccessMessage({success: t("cartUpdatedSuccess")});
                result.itemCart && addItem(result.itemCart);
                onOpen();
            } else if (result.error) {
                showErrorMessage({ error: result.error });
            }
        } catch (error: any) {
            showErrorMessage({ error: t("unexpectedError") });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Card shadow="none"
                className={'w-full max-w-full md:max-w-3xl'}
            >
                <CardBody className={"p-0 py-4 justify-center items-center"}>
                    {productData && (
                        <div className={" md:flex  w-full gap-x-4"} >
                            <div>
                                <div className={cn('w-full md:w-[258px] aspect-square',
                                    isSmall ? "max-w-full" : "max-w-[400px]"
                                )}>
                                    <Card shadow="none"
                                        isFooterBlurred
                                        className={cn(`flex w-full justify-start items-start shadow-none rounded-none ml-4`,
                                            isSmall ? "ml-0" : "ml-4"
                                        )}
                                    >
                                        <Image
                                            removeWrapper
                                            alt={productData.name}
                                            radius={'none'}
                                            className={cn("w-full",
                                                isSmall ? "rounded-none border-none" : "rounded-xl"
                                            )}
                                            src={mainImage}
                                        />
                                    </Card>
                                </div>
                                <div className="flex flex-row gap-2 mt-2 justify-start w-full px-4">
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
                                                ))}
                                            </>
                                        )}
                                </div>
                            </div>

                            <div className={"flex flex-col px-4 py-4 w-full  gap-4"}>
                                <div className="flex justify-between items-center w-full">
                                    {/* <div className="flex items-center gap-1"> */}
                                        {/* <span className="text-yellow-500">★★★★☆</span>
                                        <span className="text-xs text-default-600">4.0</span> */}
                                    {/* </div> */}
                                    <p className={`font-semibold text-2xl`}>
                                        {formatCurrency(productData.price)}
                                    </p>
                                </div>
                                <p className={`text-base font-medium`}>
                                    {productData.name}
                                </p>
                                <p className={'font-light text-sm whitespace-pre-wrap'}>{productData.description}</p>
                                {productData.ingredients && productData.ingredients.length > 0 && (
                                    <CustomAlert
                                        color="default"
                                        title={t("ingredients")}
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
                                {productData.allergies && productData.allergies.length > 0 && (
                                    <CustomAlert color="warning" title={t("allergies")} hideIcon>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {productData.allergies.map((allergies, index) => {
                                                return (
                                                    <div
                                                        key={allergies}
                                                        className={`flex items-center gap-1 px-2 py-1 text-sm rounded-full text-warning-800 bg-warning-200`}
                                                    >
                                                        <AllergenIcon allergen={allergies} />
                                                        <span>
                                                            {c_T(`Allergies.${allergies}`)}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CustomAlert>
                                )}

                                {/* Special Category Alert: Success variant */}
                                {productData.dietary && productData.dietary.length > 0 && (
                                    <CustomAlert 
                                        color="success" 
                                        title={t("specialCategory")} 
                                        hideIcon
                                        classNames={{
                                            title: "text-success-700 font-medium"
                                        }}
                                    >
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {productData.dietary.map((diet) => {
                                                return (
                                                    <div
                                                        key={diet}
                                                        className={`flex items-center gap-1 px-2 py-1 text-sm rounded-full text-success-700 bg-success-100`}
                                                    >
                                                        <Icon icon="mdi:food-certified" className="text-success-600" width={18} />
                                                        <span>
                                                            {c_T(`Dietary.${diet}`)}
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
                                    label={t("notes")}
                                    labelPlacement={"outside"}
                                    placeholder={t("addNotesPlaceholder")}
                                    style={{resize: "none"}}
                                    className="mt-2"
                                    classNames={{
                                        inputWrapper: cn("bg-background group-data-[focus=true]:bg-background"),
                                        input: cn("min-h-[40px] "),
                                    }}
                                    value={note}
                                    minRows={4}
                                    maxRows={5}
                                    onValueChange={(value) => {
                                        setNote(value);
                                        setCharCount(value.length);
                                    }}
                                />
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