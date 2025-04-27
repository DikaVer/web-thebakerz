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
import { formatCurrency, scheduledToCalendarDateTime } from "@/lib/utils";
import { CopyText } from "@/components/ui/copy-text";
import { InputStepper } from "@/components/store/product/dialog/button-stepper";
import {ItemCart, Variant} from "@/lib/actions/cart";
import { updateCart } from "@/lib/actions/cart";
import showErrorMessage from "@/components/toast/toast-error";
import showSuccessMessage from "@/components/toast/toast-succes";
import CustomAlert from "@/components/ui/custom-alerts";
import {Icon} from "@iconify/react";
import {useMediaQuery} from "usehooks-ts";
import {AllergenIcon} from "@/components/store/product/components/allergy-icons";
import {useCart} from "@/components/providers/cart-provider";
import {useTranslations} from "next-intl";
import VariantsUserSelection from "@/components/store/product/components/variants-user-selection";
import {useRouter} from "next/navigation";
import { removeAllSchedules} from "@/app/(store)/[id]/actions";
import { getOrderTime } from "@/app/(store)/[id]/actions";
import { getDeliveryTime } from "@/app/(store)/[id]/actions";
import { useDelivery } from "@/components/providers/delivery-provider";
import { getLocalTimeZone } from '@internationalized/date';
import { DietaryIcon } from "../components/super-icons";

type ProductDialogProps = {
    productData: ProductData;
    onClose: () => void;
    itemCart?: ItemCart;
    isBakerzStore: boolean;
};

export default function UserProductDialog({
                                              productData,
                                              onClose,
                                              itemCart,
                                              isBakerzStore
                                          }: ProductDialogProps) 
                                          {
    const c_T = useTranslations();
    const t = useTranslations("app/(store)/components/product-page");

    const [charCount, setCharCount] = useState(itemCart?.note ? itemCart?.note.length : 0);
    const [quantity, setQuantity] = useState(itemCart?.quantity || productData?.min_order || 1);
    const [note, setNote] = useState(itemCart?.note || "");
    const [isLoading, setIsLoading] = useState(false);
    const [variants, setVariants] = useState<Variant[]>(itemCart?.variants || []);
    const totalPrice = formatCurrency(((productData?.price || 1) + variants.reduce((sum, variant) => sum + (variant.selectedItems ? variant.selectedItems.reduce((itemSum, item) => itemSum + (item.price || 0), 0) : 0), 0)) * quantity);
    // Add state to track the current main image
    const [mainImage, setMainImage] = useState(productData.picture);
    // Get origin of the current page from window object
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const router = useRouter();

    // Function to handle image swapping
    const handleImageSwap = (additionalImage: string) => {
        // Set the clicked additional image as the main image
        setMainImage(additionalImage);
    };

    const handleEditItem = () => {
        setIsLoading(true);
        router.push(`/${productData.store_name || productData.store_id}/item/${productData.web_name}`); 
        onClose();
        setIsLoading(false);
    };

    const {
        addItem,
        updateItem,
    } = useCart();
    const {isDelivery, validationResult, setSelectedDate} = useDelivery();
    const isSmall = useMediaQuery("(max-width: 432px)");

    // This function calls the updateCart server action.
    const handleUpdateCart = async () => {
        setIsLoading(true);
        try {
            if (!itemCart){// Call our server action to update (or add) the cart item.
                // We pass productData.id as product_id, productData.store_id as store_id, and the note and quantity.
                const result = await updateCart(productData.id, productData.store_id, quantity, note, variants);
                if (result.success) {
                    const dateTime = isDelivery ? await getDeliveryTime(productData.store_id, validationResult?.deliveryRegion?.name || "") : await getOrderTime(productData.store_id);
                    // Check if we have both date and time
                    if (dateTime.date && dateTime.time) {
                        // Check lead time validation
                        const selectedDateTime = scheduledToCalendarDateTime({date: dateTime.date, time: dateTime.time});
                        const currentDateTime = new Date();
                        const minLeadTime = productData.min_lead_time || 0; // in minutes
                        const minDateTime = new Date(currentDateTime.getTime() + minLeadTime * 60000);
                        const selectedDate = selectedDateTime.toDate(getLocalTimeZone());
                        if (selectedDate < minDateTime) {
                            await removeAllSchedules();
                            setSelectedDate(undefined);
                        }
                    }
                    showSuccessMessage({success: t("cartUpdatedSuccess")});
                    result.itemCart && addItem(result.itemCart);
                    onClose();
                } else if (result.error) {
                    showErrorMessage({ error: result.error });
                }
            } else {
                await updateItem({...itemCart, note, quantity, variants}) && onClose();
            }
        } catch (error: any) {
            showErrorMessage({ error: t("unexpectedError") });
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
                {isBakerzStore && (
                        <p
                            className="text-xl font-medium"
                        >
                            {t("CustomerView")}
                        </p>
                    )}
                <div className="flex items-center gap-2">
                    <CopyText
                        onClose={onClose}
                        isIconOnly={true}
                        copyText={
                            origin + "/" +
                            (productData?.store_name || productData?.store_id) +
                            "/item/" +
                            (productData?.web_name)
                        }
                        textNotify={t("productLinkCopied")}
                    >
                        <Icon icon="mi:share" width={32} className="text-default-400" strokeWidth={2} stroke={"2"}/>
                    </CopyText>
                </div>
            </ModalHeader>
            <ModalBody className={"p-0 justify-center items-center"}>
                {productData && (
                    <ScrollShadow className={" md:flex  max-h-[80svh] w-full gap-x-4"} size={0}>
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

                        <div className={"flex flex-col px-4 py-2 w-full text-default-400 gap-4"}>
                            <p className={'font-light text-sm'}>{productData.description}</p>
                            {/* Ingredients Alert: Default variant */}
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
                            {/* Allergies Alert: Warning variant */}
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
                                                    className={`flex items-center flex- gap-1 px-2 py-1 text-sm rounded-full text-success-700 bg-success-100`}
                                                >
                                                    <DietaryIcon dietary={diet} size={28} />
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
                {isBakerzStore ? (
                    <Button
                        className={"w-full bg-gradient-primary"}
                        color="primary"
                        onPress={handleEditItem}
                        isLoading={isLoading}
                    >
                        {!isLoading && t("EditItem")}
                    </Button>
                ) : (
                    <>
                        <InputStepper
                            min={productData?.min_order || 1}
                            max={999}
                            value={quantity}
                            onChange={setQuantity}
                        />
                        <Button
                            className={"w-full bg-gradient-primary"}
                            color="primary"
                            onPress={handleUpdateCart}
                            isLoading={isLoading}
                        >
                            { !isLoading ? (`${itemCart ? t("Update") : t("Add")} ${quantity} ${t("to order")} • ${totalPrice}`) : t("Updating Cart") }
                        </Button>
                    </>
                )}
            </ModalFooter>
        </>
    );
}