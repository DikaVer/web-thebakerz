"use client";

import {Divider, Image, Select, SelectItem, Input, Checkbox} from "@heroui/react";
import {formatCurrency} from "@/lib/utils";
import React from "react";
import { useTranslations } from "next-intl";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";

import {ProductDataFull} from "@/lib/actions/product";
import { RescueDealType } from "@/lib/utils/schemas/rescue-schema";

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

    const watchedProducts = watch('products') || [];

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

    const handleQuantityChange = (productId: string, value: string) => {
        const newValue = parseInt(value) || 1;
        const productIndex = watchedProducts.findIndex((p) => p.id === productId);

        if (productIndex > -1) {
            setValue(`products.${productIndex}.quantity`, newValue, { shouldDirty: true });
        }
    };

    const handleCheckboxChange = (productId: string, checked: boolean) => {
        const productIndex = watchedProducts.findIndex((p) => p.id === productId);
        if (productIndex > -1) {
            setValue(`products.${productIndex}.isSelected`, checked, { shouldDirty: true });
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
                            <div className={'col-span-2'}>
                                <Select
                                    placeholder="50%"
                                    selectedKeys={[formProductData.promotionPercent.toString()]}
                                    onChange={(e) => handlePromotionChange(product.id, e.target.value)}
                                    className="max-w-xs"
                                    size="sm"
                                    isDisabled={!isSelected}
                                >
                                    {promotionOptions.map((option) => (
                                        <SelectItem key={option.key}>{option.label}</SelectItem>
                                    ))}
                                </Select>
                            </div>
                            
                            {/* Quantity */}
                            <div className={'col-span-2'}>
                                <Input
                                    type="number"
                                    placeholder="1"
                                    min={1}
                                    value={formProductData.quantity.toString()}
                                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                    className="max-w-xs"
                                    size="sm"
                                    isDisabled={!isSelected}
                                />
                            </div>
                            
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