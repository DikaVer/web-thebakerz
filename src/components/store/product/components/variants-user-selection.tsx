'use client';
import React, { useState, useEffect } from "react";
import {cn, Listbox, ListboxItem, ListboxSection } from "@heroui/react";
import { Variant } from "@/lib/actions/cart";
import { ProductData } from "@/lib/actions/product";
import { useTranslations } from "next-intl";
import {formatCurrency} from "@/lib/utils";

const ListboxWrapper = ({children}: { children: React.ReactNode}) => (
    <div className="w-full border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100">
        {children}
    </div>
);

type Selection = string | Set<string>;

interface VariantsUserSelectionProps {
    productData?: ProductData;
    variants?: Variant[];
    setVariants: (variants: Variant[]) => void;
}

export default function VariantsUserSelection({
                                                  productData,
                                                  variants = [],
                                                  setVariants
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


        if(process.env.NODE_ENV === 'development') console.log("Updated variants:", updatedVariants);
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
                <div key={`${variant.label}-${index}`} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <span className="text-medium font-medium text-text">
                            {variant.label}
                            {variant.required && <span className="text-danger ml-1">*</span>}
                        </span>
                        {variant.maxSelections && !variant.isSingle && (
                            <span className={cn("text-small text-default-500",
                                getDefaultKeys(variant).size > variant.maxSelections ? "text-danger" : "text-default-500"
                            )}>
                                {t("max")}: {variant.maxSelections}
                            </span>
                        )}
                    </div>

                    <ListboxWrapper>
                        <Listbox
                            aria-label={variant.label}
                            disallowEmptySelection={variant.required}
                            selectedKeys={getDefaultKeys(variant)}
                            selectionMode={getSelectionMode(variant)}
                            variant="flat"
                            //@ts-ignore
                            onSelectionChange={handleSelectionChange(variant.label, variant)}
                        >
                            {variant.options.map((option) => (
                                <ListboxItem key={option.label} textValue={option.label}>
                                    <div className="flex justify-between items-center">
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