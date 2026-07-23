/**
 * @fileoverview Product rows for selecting items in a rescue deal form.
 *
 * Exports the RescueDealItem client component, which lists all store products
 * with image and price, a checkbox to include each product in the rescue
 * deal, a discount percentage select (10-80%), and a quantity input with
 * minimum-quantity validation. It writes changes directly into the parent
 * react-hook-form state via the setValue/watch props and adapts its layout
 * for mobile screens.
 */
"use client";

import {Divider, Image, Select, SelectItem, Input, Checkbox, NumberInput, cn, Spacer} from "@heroui/react";
import {formatCurrency} from "@/lib/utils";
import React, { ChangeEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";

import {ProductDataFull} from "@/lib/actions/product";
import { RescueDealType } from "@/lib/utils/schemas/rescue-schema";
import { useMediaQuery } from "usehooks-ts";

type RescueProductInForm = RescueDealType['products'][number] & { isSelected: boolean };
type RescueDealInForm = Omit<RescueDealType, 'products'> & { products: RescueProductInForm[] };

export interface RescueDealItemProps {
    productsData: ProductDataFull;
    setValue: UseFormSetValue<RescueDealInForm>;
    watch: UseFormWatch<RescueDealInForm>;
}

export const RescueDealItem: React.FC<RescueDealItemProps> = ({ 
    productsData, 
    setValue,
    watch,
}) => {
    const t = useTranslations("app/(return_page)/settings/components/rescue-deal");
    const productIds = Object.keys(productsData);
    const isMobile = useMediaQuery('(max-width: 768px)');

    const watchedProducts = watch('products') || [];
    
    // State to track errors for each product
    const [quantityErrors, setQuantityErrors] = useState<Record<string, string>>({});

    const promotionOptions = [
        { key: "10", label: "10%" },
        { key: "15", label: "15%" },
        { key: "25", label: "25%" },
        { key: "30", label: "30%" },
        { key: "40", label: "40%" },
        { key: "50", label: "50%" },
        { key: "60", label: "60%" },
        { key: "75", label: "75%" },
        { key: "80", label: "80%" },
    ];

    const handlePromotionChange = (productId: string, value: string) => {
        const newValue = parseInt(value);
        const productIndex = watchedProducts.findIndex((p) => p.id === productId);

        if (productIndex > -1) {
            setValue(`products.${productIndex}.promotionPercent`, newValue, { shouldDirty: true });
        }
    };

    const validateQuantity = (productId: string, value: number) => {
        if (value < 1) {
            setQuantityErrors(prev => ({
                ...prev,
                [productId]: "Quantity must be at least 1"
            }));
            return false;
        } else {
            setQuantityErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[productId];
                return newErrors;
            });
            return true;
        }
    };

    const handleQuantityChange = (productId: string, value: number | ChangeEvent<HTMLInputElement>) => {
        const productIndex = watchedProducts.findIndex((p) => p.id === productId);
        const numericValue = typeof value === 'number' ? value : parseInt(value.target.value);

        if (productIndex > -1) {
            setValue(`products.${productIndex}.quantity`, numericValue, { shouldDirty: true });
            validateQuantity(productId, numericValue);
        }
    };

    const handleQuantityError = (productId: string, error: any) => {
        if (error && error.validationDetails) {
            setQuantityErrors(prev => ({
                ...prev,
                [productId]: "Quantity must be at least 1"
            }));
        }
    };

    const handleCheckboxChange = (productId: string, checked: boolean) => {
        const productIndex = watchedProducts.findIndex((p) => p.id === productId);
        if (productIndex > -1) {
            setValue(`products.${productIndex}.isSelected`, checked, { shouldDirty: true });
            // Clear error and reset quantity to 1 when item is deselected
            if (!checked) {
                setValue(`products.${productIndex}.quantity`, 1, { shouldDirty: true });
                setQuantityErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[productId];
                    return newErrors;
                });
            }
        }
    };

    return (
        <>
            {productIds.map((consId, index) => {
                const product = productsData[consId];
                if (!product) return null;

                const productIndex = watchedProducts.findIndex(p => p.id === product.id);
                if (productIndex === -1) {
                    return null; 
                }
                
                const formProductData = watchedProducts[productIndex];
                const isSelected = formProductData.isSelected;
                const hasError = quantityErrors[product.id];

                return (
                    <React.Fragment key={consId}>
                        <div className="grid grid-cols-12 gap-x-4 p-2 rounded-lg group">
                            {/* Product Image */}
                            <div className={'col-span-2'}>
                                <Image
                                    src={product.picture}
                                    alt={product.name}
                                    width={80}
                                />
                            </div>
                            
                            {/* Product Info */}
                            <div className={'flex flex-col justify-between text-start col-span-4'}>
                                <div className="flex items-center gap-2">
                                    <span>{product.name}</span>
                                </div>
                                <span className={'text-small text-default-500 font-medium'}>
                                    {formatCurrency(product.price)}
                                </span>
                            </div>
                            
                            {/* Promotion Percentage */}
                            <div className={cn('col-span-2', isMobile && 'col-span-4')}>
                                <Select
                                    placeholder="50%"
                                    selectedKeys={[formProductData.promotionPercent.toString()]}
                                    onChange={(e) => handlePromotionChange(product.id, e.target.value)}
                                    className="max-w-xs"
                                    size="sm"
                                    classNames={{
                                        popoverContent: "min-w-24",
                                    }}
                                    isDisabled={!isSelected}
                                >
                                    {promotionOptions.map((option) => (
                                        <SelectItem key={option.key}>{option.label}</SelectItem>
                                    ))}
                                </Select>
                                {isMobile && (
                                    <div className="mt-2">
                                        <NumberInput
                                            placeholder="1"
                                            min={1}
                                            value={formProductData.quantity}
                                            onChange={(e) => handleQuantityChange(product.id, e)}
                                            className="max-w-xs"
                                            onError={(e) => handleQuantityError(product.id, e)}
                                            size="sm"
                                            isDisabled={!isSelected}
                                            isInvalid={!!hasError && isSelected}
                                            errorMessage={hasError && isSelected ? hasError : undefined}
                                        />
                                    </div>
                                )}
                            </div>
                            
                            {/* Quantity */}
                            {!isMobile && (
                                <div className={'col-span-2'}>
                                    <NumberInput
                                        placeholder="1"
                                        min={1}
                                        value={formProductData.quantity}
                                        onChange={(e) => handleQuantityChange(product.id, e)}
                                        className="max-w-xs"
                                        onError={(e) => handleQuantityError(product.id, e)}
                                        size="sm"
                                        isDisabled={!isSelected}
                                        isInvalid={!!hasError && isSelected}
                                        errorMessage={hasError && isSelected ? hasError : undefined}
                                    />
                                </div>
                            )}
                            
                            {/* Selection Checkbox */}
                            <div className={'col-span-2 flex justify-center items-center'}>
                                <Checkbox
                                    classNames={{
                                        wrapper: 'before:border-background-secondary',
                                    }}
                                    isSelected={isSelected}
                                    onValueChange={(checked: boolean) => handleCheckboxChange(product.id, checked)}
                                    color="primary"
                                />
                            </div>
                        </div>
                        {index < productIds.length - 1 && (
                            <Divider className="my-2" />
                        )}
                    </React.Fragment>
                );
            })}
        </>
    );
}