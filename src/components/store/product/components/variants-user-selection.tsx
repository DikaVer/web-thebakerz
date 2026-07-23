/**
 * @fileoverview Customer-facing selector for product variant options.
 *
 * Exports the VariantsUserSelection client component, which renders each
 * variant group of a product as a Hero UI Listbox in single or multiple
 * selection mode, shows required markers, min/max selection hints, and
 * validation errors, and reports the chosen options back to the parent via
 * the setVariants callback for cart pricing.
 */
'use client';
import React, { useState, useEffect } from "react";
import {cn, Listbox, ListboxItem} from "@heroui/react";
import { Variant } from "@/lib/actions/cart";
import { ProductData } from "@/lib/actions/product";
import { useTranslations } from "next-intl";
import {formatCurrency} from "@/lib/utils";
import { logger } from "@/lib/logger";

const ListboxWrapper = ({children, hasError}: { children: React.ReactNode, hasError?: boolean}) => (
    <div className={cn("w-full rounded-small", hasError && "border border-danger p-1 rounded-md")}>
        {children}
    </div>
);

type Selection = string | Set<string>;

interface VariantsUserSelectionProps {
    productData?: ProductData;
    variants?: Variant[];
    setVariants: (variants: Variant[]) => void;
    errors?: {[label: string]: string};
}

export default function VariantsUserSelection({
                                                  productData,
                                                  variants = [],
                                                  setVariants,
                                                  errors = {}
                                              }: VariantsUserSelectionProps) {
    const t = useTranslations("app/(store)/components/variants-user-selection");

    // Initialize selected keys for each variant
    const [selectedVariantsMap, setSelectedVariantsMap] = useState<{[label: string]: Set<string>}>({});

    // Initialize from existing variants
    useEffect(() => {
        if (variants && variants.length > 0) {
            const newSelectedMap: {[label: string]: Set<string>} = {};

            variants.forEach(variant => {
                const selectedLabels = new Set(variant.selectedItems.map(item => item.label));
                newSelectedMap[variant.label] = selectedLabels;
            });

            setSelectedVariantsMap(newSelectedMap);
        }
    }, []);

    if (!productData || !productData.variants || productData.variants.length === 0) {
        return null;
    }

    // Handle selection change for a specific variant
    const handleSelectionChange = (variantLabel: string, variantConfig: any) => (keys: Selection) => {
        // Convert keys to Set if it's a string
        const selectedKeys = typeof keys === 'string' ? new Set([keys]) : keys;

        // Update the selected keys for this variant
        setSelectedVariantsMap(prev => ({
            ...prev,
            [variantLabel]: selectedKeys
        }));

        // Update the parent component's variants state
        const updatedVariants = productData.variants?.map(variant => {
            if (variant.label !== variantLabel) {
                // Find existing variant in current variants
                const existingVariant = variants.find(v => v.label === variant.label);
                return existingVariant || {
                    label: variant.label,
                    selectedItems: []
                };
            }

            // Create the updated variant with selected items
            const selectedOptions = variant.options.filter(option =>
                selectedKeys.has(option.label)
            );

            return {
                label: variantLabel,
                selectedItems: selectedOptions
            };
        }).filter(v => v.selectedItems.length > 0) as Variant[];


        logger.debug('variantsSelection', "Updated variants:", { updatedVariants });
        setVariants(updatedVariants);
    };

    // Get selection mode based on variant config
    const getSelectionMode = (variant: any) => {
        return variant.isSingle ? "single" : "multiple";
    };

    // Check if a variant has any selections
    const hasSelections = (variantLabel: string) => {
        return selectedVariantsMap[variantLabel]?.size > 0;
    };

    // Get default keys for a variant
    const getDefaultKeys = (variant: any) => {
        return selectedVariantsMap[variant.label] || new Set();
    };

    return (
        <div className="flex flex-col gap-4">
            {productData.variants.map((variant, index) => (
                <div key={`${variant.label}-${index}`} className="flex flex-col gap-2 mt-2">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-text">
                            {variant.label}
                            {variant.required && <span className="text-danger ml-1">*</span>}
                        </span>
                        <div className="flex items-center gap-2">
                            {variant.minSelections && !variant.isSingle && (
                                <span className={cn("text-small", 
                                    (selectedVariantsMap[variant.label]?.size || 0) < variant.minSelections ? "text-danger" : "text-default-500"
                                )}>
                                    {t("min")}: {variant.minSelections}
                                </span>
                            )}
                            {variant.maxSelections && !variant.isSingle && (
                                <span className={cn("text-small",
                                    getDefaultKeys(variant).size > variant.maxSelections ? "text-danger" : "text-default-500"
                                )}>
                                    {t("max")}: {variant.maxSelections}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    {errors[variant.label] && (
                        <div className="text-danger text-sm mt-1 mb-1 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            {errors[variant.label]}
                        </div>
                    )}

                    <ListboxWrapper
                        hasError={!!errors[variant.label]}
                    >
                        <Listbox
                            aria-label={variant.label}
                            disallowEmptySelection={variant.required}
                            selectedKeys={getDefaultKeys(variant)}
                            selectionMode={getSelectionMode(variant)}
                            hideSelectedIcon
                            //@ts-ignore
                            onSelectionChange={handleSelectionChange(variant.label, variant)}
                            itemClasses={{
                                base: "data-[hover=true]:bg-default-100 p-0",
                                title: "text-medium",
                            }}
                            classNames={{
                                base: "p-0",
                                list: "gap-0",
                            }}
                        >
                            {variant.options.map((option) => (
                                <ListboxItem 
                                    key={option.label} 
                                    textValue={option.label}
                                    classNames={{
                                        base: "py-4 border-b border-default-200 rounded-none",
                                    }}
                                    endContent={
                                        variant.isSingle ? 
                                        <div className="flex items-center justify-center">
                                            <div className={cn("w-6 h-6 rounded-full border-default-300 flex items-center justify-center data-[selected=true]:border-primary bg-default-200", 
                                                getDefaultKeys(variant).has(option.label) ? "border-2" : "shadow-inner border")} 
                                                data-selected={getDefaultKeys(variant).has(option.label)}>
                                                {getDefaultKeys(variant).has(option.label) && <div className="w-3 h-3 rounded-full bg-primary" />}
                                            </div>
                                        </div> :
                                        <div className="flex items-center justify-center">
                                            <div className={cn("w-6 h-6 rounded-sm bg-default-200 flex items-center justify-center data-[selected=true]:bg-primary data-[selected=true]:border-primary transition-all duration-200", 
                                                !getDefaultKeys(variant).has(option.label) ? "shadow-inner border border-default-300" : "")} 
                                                data-selected={getDefaultKeys(variant).has(option.label)}>
                                                {getDefaultKeys(variant).has(option.label) && (
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                                                        <path d="M16 7L9 14L5 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-draw-checkmark"/>
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    }
                                >
                                    <div className="flex font-light text-md items-center w-full gap-3">
                                        <span>{option.label}</span>
                                        {option.price > 0 && (
                                            <span className="text-small text-default-500">
                                                + {formatCurrency(option.price)}
                                            </span>
                                        )}
                                    </div>
                                </ListboxItem>
                            ))}
                        </Listbox>
                    </ListboxWrapper>
                </div>
            ))}
        </div>
    );
}