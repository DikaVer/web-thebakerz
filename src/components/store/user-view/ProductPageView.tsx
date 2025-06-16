'use client';
import React, { useState } from "react";
import { ProductData} from "@/lib/actions/product";
import { useTranslations } from "next-intl";
import { Card, Button, Divider, CardHeader } from "@heroui/react";
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
import { useSignInModal } from "@/components/ui/modal-signin";
import { ReportProductModal } from "./report-product-modal";
import { useDisclosure } from "@heroui/react";
import { useSession } from "@/components/providers/session-provider";
import clarity from "@microsoft/clarity";
import { useStore } from "@/components/providers/store-provider";

interface ProductPageViewProps {
    productData: ProductData;
    rescueDealInfo?: { promotionPercent: number; quantity: number; isSelected: boolean} | null;
}

export const ProductPageView: React.FC<ProductPageViewProps> = ({
    productData,
    rescueDealInfo
}) => {
    const t = useTranslations("app/(store)/components/product-page");
    const product = productData;
    const { session } = useSession();

    // State for user interactions
    const [quantity, setQuantity] = useState(product?.min_order || 1);
    const [note, setNote] = useState("");
    const [variants, setVariants] = useState<Variant[]>([]);
    const [variantErrors, setVariantErrors] = useState<{[label: string]: string}>({});
    const [isLoading, setIsLoading] = useState(false);
    const { isOpen: isReportOpen, onOpen: onReportOpen, onOpenChange: onReportChange } = useDisclosure();
    const { openModal, ModalSign } = useSignInModal();
    const { store } = useStore();
    const { addItem } = useCart();
    const { isDelivery, validationResult, setSelectedDate, deliveryAddressModal, isRescueDeal } = useDelivery();

    // Handle adding to cart
    const handleAddToCart = async () => {

        // Check rescue deal availability
        if (rescueDealInfo && isRescueDeal) {
            if (rescueDealInfo.quantity <= 0 || !rescueDealInfo.isSelected) {
                return;
            }
        }

        if (isDelivery && (!validationResult?.isValid || !validationResult?.isInRange)) {
            deliveryAddressModal.onOpen();
            return;
        }
        
        // Reset previous errors
        setVariantErrors({});

        // Validate variants before proceeding
        const errors: {[label: string]: string} = {};
        let hasErrors = false;
        
        if (productData.variants && productData.variants.length > 0 && !isRescueDeal) {
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
            clarity.event("product_add_to_cart")
            // Call our server action to add the item to cart
            const result = await updateCart(
                product.id, 
                product.store_id, 
                quantity, 
                isDelivery ? "delivery" : "pickup", 
                note, 
                variants,
                undefined,
                undefined,
                isRescueDeal
            );
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
        clarity.event("product_share")
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: "Check out this product on TheBakerz!",
                url: origin + "/" + (store?.storeName || product?.store_id) + "/item/" + (product?.id)
            });
        } else {
            navigator.clipboard.writeText(origin + "/" + (store?.storeName || product?.store_id) + "/item/" + (product?.id));
            showSuccessMessage({success: t("productLinkCopied")});
        }
    };

    return (
        <div className={`py-8 ${rescueDealInfo && isRescueDeal && (rescueDealInfo.quantity <= 0 || !rescueDealInfo.isSelected) ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Sign-in modal */}
            <ModalSign 
                message="You need to sign in to report products"
            />
            <ReportProductModal 
                isOpen={isReportOpen}
                onOpenChange={onReportChange}
                productName={product.name}
                storeName={store?.storeName || ""}
                productId={product.id}
            />
            <Card className=" md:p-6">
                <CardHeader
                    className="justify-end items-center gap-2 p-4 md:p-0"
                >
                    
                    <Button
                        aria-label="Share product"
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
                                id={product.id}
                                storeId={product.store_id}
                                name={product.name}
                                price={product.price}
                                description={product.description || ""}
                                totalLikes={product.totalLikes}
                                image={product.picture}
                                rescueDealInfo={rescueDealInfo}
                                isRescueDeal={isRescueDeal}
                            />

                            {/* Rescue Deal Stock Information */}
                            {(rescueDealInfo && isRescueDeal) && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-danger-50 border border-danger-200">
                                    <Icon icon="solar:fire-bold" className="text-danger-500" width={20} />
                                    {(rescueDealInfo.quantity > 0 && rescueDealInfo.isSelected) ? (
                                        <>
                                            <span>Rescue Deal Stock: </span>
                                            <span className="font-bold">
                                                {rescueDealInfo.quantity} left
                                            </span>
                                        </>
                                    ) : (
                                        <span className="font-bold text-danger-500">Out of Stock</span>
                                    )}
                                </div>
                            )}
                            
                            <Divider className="my-4" />
                            
                            <ProductDetails
                                ingredients={product.ingredients}
                                allergies={product.allergies}
                                dietary={product.dietary}
                            />
                            
                            {(!isRescueDeal && product.variants && product.variants.length > 0) && (
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

                            <div className="flex w-full justify-end gap-2">
                                <Button
                                    aria-label="Report product"
                                    className="aspect-square w-8 h-8  min-w-0 p-0 text-foreground border-small border-foreground"
                                    onPress={() => {
                                        if (!session?.user) {
                                            openModal();
                                            return;
                                        }
                                        onReportOpen();
                                    }}
                                >
                                    <Icon 
                                        icon="solar:flag-linear" 
                                        width={18} 
                                    />
                                </Button>
                            </div>
                            
                            <div className="flex items-center gap-4 pt-4">
                                <ProductActions
                                    price={rescueDealInfo && isRescueDeal ? 
                                        product.price * (1 - rescueDealInfo.promotionPercent / 100) : 
                                        product.price
                                    }
                                    quantity={quantity}
                                    setQuantity={setQuantity}
                                    minOrder={isRescueDeal ? 1 : product?.min_order || 1}
                                    maxOrder={rescueDealInfo && isRescueDeal ? rescueDealInfo.quantity : undefined}
                                    isPostDelivery={product.isPostDelivery}
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