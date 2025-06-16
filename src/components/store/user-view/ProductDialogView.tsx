'use client';
import React, { useState, useRef, useEffect } from "react";
import {
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    ScrollShadow,
    useDisclosure
} from "@heroui/react";
import { ProductData } from "@/lib/actions/product";
import { scheduledToCalendarDateTime } from "@/lib/utils";
import { ItemCart, Variant } from "@/lib/actions/cart";
import { updateCart } from "@/lib/actions/cart";
import showErrorMessage from "@/components/toast/toast-error";
import showSuccessMessage from "@/components/toast/toast-succes";
import { Icon } from "@iconify/react";
import { useMediaQuery } from "usehooks-ts";
import { useCart } from "@/components/providers/cart-provider";
import { useTranslations } from "next-intl";
import VariantsUserSelection from "@/components/store/product/components/variants-user-selection";
import { usePathname, useRouter } from "next/navigation";
import { removeAllSchedules } from "@/app/(store)/[id]/actions";
import { getOrderTime } from "@/app/(store)/[id]/actions";
import { getDeliveryTime } from "@/app/(store)/[id]/actions";
import { useDelivery } from "@/components/providers/delivery-provider";
import { getLocalTimeZone } from '@internationalized/date';

// Import our modular components
import { ProductImageGallery } from './ProductImageGallery';
import { ProductInfo } from './ProductInfo';
import { ProductDetails } from './ProductDetails';
import { ProductNotes } from './ProductNotes';
import { ProductActions } from './ProductActions';
import { ReportProductModal } from "./report-product-modal";
import { useSignInModal } from "@/components/ui/modal-signin";
import { useSession } from "@/components/providers/session-provider";
import clarity from "@microsoft/clarity";
import { useStore } from "@/components/providers/store-provider";
import { RescueDealProduct } from "@/lib/actions/rescue-deal";

type ProductDialogViewProps = {
    productData: ProductData;
    onClose: () => void;
    itemCart?: ItemCart;
    isBakerzStore: boolean;
    rescueDealInfo?: RescueDealProduct | null;
};

export default function ProductDialogView({
    productData,
    onClose,
    itemCart,
    isBakerzStore,
    rescueDealInfo
}: ProductDialogViewProps) {
    const t = useTranslations("app/(store)/components/product-page");

    const [quantity, setQuantity] = useState(itemCart?.quantity || productData?.min_order || 1);
    const [note, setNote] = useState(itemCart?.note || "");
    const [isLoading, setIsLoading] = useState(false);
    const [variants, setVariants] = useState<Variant[]>(itemCart?.variants || []);
    const [variantErrors, setVariantErrors] = useState<{[label: string]: string}>({});
    const variantsRef = useRef<HTMLDivElement>(null);
    const isSmall = useMediaQuery("(max-width: 432px)");
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const router = useRouter();
    const pathname = usePathname();
    const isSearch = pathname.includes("search");
    const { isOpen: isReportOpen, onOpen: onReportOpen, onOpenChange: onReportChange } = useDisclosure();
    const { openModal, ModalSign } = useSignInModal();
    const { session } = useSession();
    const { store } = useStore();


    useEffect(() => {
        if (pathname.includes("item")) {
            onClose();
            setIsLoading(false);
        }
    }, [pathname]);

    const {
        addItem,
        updateItem,
    } = isSearch ? {
        addItem: () => router.push(`/${store?.storeName || productData.store_id}/item/${productData.id}`),
        updateItem: () => router.push(`/${store?.storeName || productData.store_id}/item/${productData.id}`)
    } : useCart();


    const {
        isDelivery, 
        validationResult, 
        setSelectedDate,
        isRescueDeal
    } = useDelivery();

    const handleShareProduct = () => {
        clarity.event("product_share")
        if (navigator.share) {
            navigator.share({
                title: productData.name,
                text: "Check out this product on TheBakerz!",
                url: origin + "/" + (store?.storeName || productData?.store_id) + "/item/" + (productData?.id)
            });
        } else {
            navigator.clipboard.writeText(origin + "/" + (store?.storeName || productData?.store_id) + "/item/" + (productData?.id));
            showSuccessMessage({success: t("productLinkCopied")});
        }
    };

    const handleEditItem = () => {
        setIsLoading(true);
        router.push(`/${store?.storeName || productData.store_id}/item/${productData.id}`); 
    };

    // This function calls the updateCart server action.
    const handleUpdateCart = async () => {
        // Check rescue deal validation first
        if(rescueDealInfo && isRescueDeal) {
            if(rescueDealInfo.quantity <= 0 || !rescueDealInfo.isSelected) {
                return;
            }
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
            // Scroll to variants section
            if (variantsRef.current) {
                variantsRef.current.scrollIntoView({ behavior: 'smooth' });
            }
            return;
        }
        
        setIsLoading(true);
        try {
            if (!itemCart) {
                clarity.event("product_add_to_cart")
                // Call our server action to update (or add) the cart item.
                const result = await updateCart(
                    productData.id, 
                    productData.store_id, 
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
                        await getDeliveryTime(productData.store_id, validationResult?.deliveryRegion?.name || "") : 
                        await getOrderTime(productData.store_id);
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
                    // showSuccessMessage({success: t("cartUpdatedSuccess")});
                    result.itemCart && addItem(result.itemCart);
                    onClose();
                } else if (result.error) {
                    showErrorMessage({ error: result.error });
                }
            } else {
                clarity.event("cart_update_item")
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
        {/* Sign-in modal */}
            <ModalSign 
                message="You need to sign in to report products"
            />
            <ReportProductModal 
                    isOpen={isReportOpen}
                    onOpenChange={onReportChange}
                    productName={productData.name}
                    storeName={store?.storeName || ""}
                    productId={productData.id}
                />
            <ModalHeader className={'px-4 justify-between'}>
                <Button aria-label="Close" isIconOnly variant={'light'} radius={'full'} onPress={onClose}>
                    <Icon icon="iconamoon:close-bold" width={32} className="text-default-400" strokeWidth={2} stroke={"2"}/>
                </Button>
                {isBakerzStore && (
                    <p className="text-xl font-medium">
                        {t("CustomerView")}
                    </p>
                )}
                <div className="flex items-center gap-2">
                    <Button
                        aria-label="Share product"
                        onPress={handleShareProduct}
                        isIconOnly={true}
                    >
                        <Icon icon="mi:share" width={32} className="text-default-400" strokeWidth={2} stroke={"2"}/>
                    </Button>
                </div>
            </ModalHeader>
            <ModalBody className={"p-0 justify-center items-center"}>
                {productData && (
                    <ScrollShadow className={"md:flex max-h-[80svh] w-full gap-x-4"} size={0}>
                        <div>
                            <ProductImageGallery
                                mainImage={productData.picture || ''}
                                additionalImages={productData.additionalImages}
                                productName={productData.name}
                            />
                        </div>

                        <div className={"flex flex-col px-4 py-2 w-full gap-4"}>
                            <ProductInfo
                                id={productData.id}
                                storeId={productData.store_id}
                                name={productData.name}
                                price={productData.price}
                                description={productData.description || ""}
                                totalLikes={productData.totalLikes}
                                image={productData.picture}
                                rescueDealInfo={rescueDealInfo}
                                isRescueDeal={isRescueDeal}
                            />

                            {/* Rescue Deal Stock Information */}
                            {(rescueDealInfo && isRescueDeal) && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-danger-50 border border-danger-200">
                                    <Icon icon="solar:fire-bold" className="text-danger-500" width={20} />
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1 text-sm font-medium text-danger-700">
                                            {(rescueDealInfo.quantity > 0 && rescueDealInfo.isSelected) ? (
                                                <>
                                                    <span>Rescue Deal Stock: </span>
                                                    <span className="font-bold">
                                                        {rescueDealInfo.quantity} left
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-danger-600">Out of Stock</span>
                                            )}
                                        </div>
                                        <span className="text-xs text-danger-600">
                                            Limited time offer - grab it before it's gone!
                                        </span>
                                    </div>
                                </div>
                            )}
                            
                            <ProductDetails
                                ingredients={productData.ingredients}
                                allergies={productData.allergies}
                                dietary={productData.dietary}
                            />

                            {(!isRescueDeal && productData.variants && productData.variants.length > 0) && (
                                <div ref={variantsRef}>
                                    <VariantsUserSelection
                                        productData={productData}
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
                                    className="aspect-square w-8 h-8 min-w-0 p-0 text-foreground border-small border-foreground"
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
                        </div>
                    </ScrollShadow>
                )}
            </ModalBody>
            <ModalFooter className={"px-4 space-x-4"}>
                <ProductActions
                    price={(rescueDealInfo && isRescueDeal) ? productData.price * (1 - rescueDealInfo.promotionPercent / 100) : productData.price}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    minOrder={isRescueDeal ? 1 : productData?.min_order || 1}
                    maxOrder={rescueDealInfo && isRescueDeal ? rescueDealInfo.quantity : undefined}
                    isUpdateMode={!!itemCart}
                    isPostDelivery={productData.isPostDelivery}
                    isBakerzStore={isBakerzStore}
                    onUpdate={handleUpdateCart}
                    onEditItem={handleEditItem}
                    isLoading={isLoading || !!(rescueDealInfo && isRescueDeal && (rescueDealInfo.quantity <= 0 || !rescueDealInfo.isSelected))}
                    variants={variants}
                />
            </ModalFooter>
        </>
    );
} 