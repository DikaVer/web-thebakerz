'use client';
import React, { useState } from "react";
import { ProductData, ProductDataFull } from "@/lib/actions/product";
import { useTranslations } from "next-intl";
import { Card, Button, Divider, cn, CardHeader } from "@heroui/react";
import { ProductImageGallery } from './ProductImageGallery';
import { ProductInfo } from './ProductInfo';
import { ProductDetails } from './ProductDetails';
import { ProductNotes } from './ProductNotes';
import { ProductActions } from './ProductActions';
import { Variant } from "@/lib/actions/cart";
import VariantsUserSelection from "@/components/store/product/components/variants-user-selection";
import { updateCart } from "@/lib/actions/cart";
import { useCart } from "@/components/providers/cart-provider";
import { useDelivery } from "@/components/providers/delivery-provider";
import { getOrderTime, getDeliveryTime, removeAllSchedules } from "@/app/(store)/[id]/actions";
import { scheduledToCalendarDateTime } from "@/lib/utils";
import { getLocalTimeZone } from '@internationalized/date';
import showSuccessMessage from "@/components/toast/toast-succes";
import showErrorMessage from "@/components/toast/toast-error";
import { Icon } from "@iconify/react/dist/iconify.js";

interface ProductPageViewProps {
    productData: ProductData;
}

export const ProductPageView: React.FC<ProductPageViewProps> = ({
    productData 
}) => {
    const t = useTranslations("app/(store)/components/product-page");
    const product = productData;

    // State for user interactions
    const [quantity, setQuantity] = useState(product?.min_order || 1);
    const [note, setNote] = useState("");
    const [variants, setVariants] = useState<Variant[]>([]);
    const [variantErrors, setVariantErrors] = useState<{[label: string]: string}>({});
    const [isLoading, setIsLoading] = useState(false);

    const { addItem } = useCart();
    const { isDelivery, validationResult, setSelectedDate } = useDelivery();

    // Handle adding to cart
    const handleAddToCart = async () => {
        // Reset previous errors
        setVariantErrors({});
        
        // Validate variants before proceeding
        const errors: {[label: string]: string} = {};
        let hasErrors = false;
        
        if (productData.variants && productData.variants.length > 0) {
            productData.variants.forEach(variant => {
                // Find the user selection for this variant
                const selectedVariant = variants.find(v => v.label === variant.label);
                const selectedCount = selectedVariant?.selectedItems.length || 0;
                
                // Check if required variant is missing
                if (variant.required && (!selectedVariant || selectedCount === 0)) {
                    errors[variant.label] = t("requiredVariant");
                    hasErrors = true;
                }
                
                // Check if minimum selections not met (for multiple choice variants)
                if (!variant.isSingle && variant.required && variant.minSelections && selectedCount && selectedCount < variant.minSelections) {
                    errors[variant.label] = t("minSelectionsRequired", {min: variant.minSelections});
                    hasErrors = true;
                }
                
                // Check if maximum selections exceeded
                if (variant.maxSelections && selectedCount > variant.maxSelections) {
                    errors[variant.label] = t("maxSelectionsExceeded", {max: variant.maxSelections});
                    hasErrors = true;
                }
            });
        }
        
        if (hasErrors) {
            setVariantErrors(errors);
            return;
        }
        
        setIsLoading(true);
        try {
            // Call our server action to add the item to cart
            const result = await updateCart(product.id, product.store_id, quantity, isDelivery ? "delivery" : "pickup", note, variants);
            if (result.success) {
                const dateTime = isDelivery ? 
                    await getDeliveryTime(product.store_id, validationResult?.deliveryRegion?.name || "") : 
                    await getOrderTime(product.store_id);
                
                // Check if we have both date and time
                if (dateTime.date && dateTime.time) {
                    // Check lead time validation
                    const selectedDateTime = scheduledToCalendarDateTime({date: dateTime.date, time: dateTime.time});
                    const currentDateTime = new Date();
                    const minLeadTime = product.min_lead_time || 0; // in minutes
                    const minDateTime = new Date(currentDateTime.getTime() + minLeadTime * 60000);
                    const selectedDate = selectedDateTime.toDate(getLocalTimeZone());
                    if (selectedDate < minDateTime) {
                        await removeAllSchedules();
                        setSelectedDate(undefined);
                    }
                }
                
                // showSuccessMessage({success: t("cartUpdatedSuccess")});
                result.itemCart && addItem(result.itemCart);
            } else if (result.error) {
                showErrorMessage({ error: result.error });
            }
        } catch (error: any) {
            showErrorMessage({ error: t("unexpectedError") });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle product sharing
    const handleShareProduct = () => {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: "Check out this product on TheBakerz!",
                url: origin + "/" + (product?.store_name || product?.store_id) + "/item/" + (product?.web_name)
            });
        } else {
            navigator.clipboard.writeText(origin + "/" + (product?.store_name || product?.store_id) + "/item/" + (product?.web_name));
            showSuccessMessage({success: t("productLinkCopied")});
        }
    };

    return (
        <div className=" py-8">
            <Card className=" md:p-6">
                <CardHeader
                    className="justify-end p-4 md:p-0"
                >
                    
                    <Button
                        onPress={handleShareProduct}
                        isIconOnly={true}
                    >
                        <Icon icon="mi:share" width={32} className="text-default-400" strokeWidth={2} stroke={"2"}/>
                    </Button>
                </CardHeader>
                <div className="md:flex gap-8">
                    <div className="md:w-fit mb-6 md:mb-0">
                        <ProductImageGallery
                            mainImage={product.picture || ''}
                            additionalImages={product.additionalImages}
                            productName={product.name}
                        />
                    </div>
                    <div className="p-4 md:p-0md:flex gap-8">  
                        <div className="md:w-fit space-y-6">
                            <ProductInfo
                                name={product.name}
                                price={product.price}
                                description={product.description || ""}
                            />
                            
                            <Divider className="my-4" />
                            
                            <ProductDetails
                                ingredients={product.ingredients}
                                allergies={product.allergies}
                                dietary={product.dietary}
                            />
                            
                            {product.variants && product.variants.length > 0 && (
                                <div>
                                    <VariantsUserSelection
                                        productData={product}
                                        variants={variants}
                                        setVariants={setVariants}
                                        errors={variantErrors}
                                    />
                                </div>
                            )}
                            
                            <ProductNotes
                                initialNote={note}
                                onChange={setNote}
                            />
                            
                            <div className="flex items-center gap-4 pt-4">
                                <ProductActions
                                    price={product.price}
                                    quantity={quantity}
                                    setQuantity={setQuantity}
                                    minOrder={product?.min_order || 1}
                                    isUpdateMode={false}
                                    onUpdate={handleAddToCart}
                                    isLoading={isLoading}
                                    variants={variants}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}; 