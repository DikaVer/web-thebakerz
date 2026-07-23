/**
 * @fileoverview Product ingredient, allergy, and dietary information panels.
 *
 * Exports the ProductDetails client component, which renders up to three
 * CustomAlert sections (default, warning, and success variants) listing the
 * product's ingredients, translated allergies, and translated dietary tags
 * as icon-labelled chips.
 */
'use client';
import React from "react";
import CustomAlert from "@/components/ui/custom-alerts";
import { AllergenIcon } from "@/components/store/product/components/allergy-icons";
import { DietaryIcon } from "@/components/store/product/components/super-icons";
import { useTranslations } from "next-intl";

interface ProductDetailsProps {
    ingredients?: string[];
    allergies?: string[];
    dietary?: string[];
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
    ingredients = [],
    allergies = [],
    dietary = []
}) => {
    const c_T = useTranslations();
    const t = useTranslations("app/(store)/components/product-page");

    return (
        <div className="flex flex-col gap-4">
            {/* Ingredients Alert: Default variant */}
            {ingredients.length > 0 && (
                <CustomAlert
                    color="default"
                    title={t("ingredients")}
                    hideIcon
                    classNames={{
                        title: "text-text font-medium"
                    }}
                >
                    <div className="flex flex-wrap gap-2 mt-4">
                        {ingredients.map((ingredient) => (
                            <div
                                key={ingredient}
                                className={`flex items-center gap-2 px-2 py-1 text-sm rounded-full text-text bg-default-200`}
                            >
                                <AllergenIcon allergen={ingredient} />
                                <span>{ingredient}</span>
                            </div>
                        ))}
                    </div>
                </CustomAlert>
            )}
            
            {/* Allergies Alert: Warning variant */}
            {allergies.length > 0 && (
                <CustomAlert color="warning" title={t("allergies")} hideIcon>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {allergies.map((allergy) => (
                            <div
                                key={allergy}
                                className={`flex items-center gap-1 px-2 py-1 text-sm rounded-full text-warning-800 bg-warning-200`}
                            >
                                <AllergenIcon allergen={allergy} />
                                <span>{c_T(`Allergies.${allergy}`)}</span>
                            </div>
                        ))}
                    </div>
                </CustomAlert>
            )}

            {/* Special Category Alert: Success variant */}
            {dietary.length > 0 && (
                <CustomAlert 
                    color="success" 
                    title={t("specialCategory")} 
                    hideIcon
                    classNames={{
                        title: "text-success-700 font-medium"
                    }}
                >
                    <div className="flex flex-wrap gap-2 mt-4">
                        {dietary.map((diet) => (
                            <div
                                key={diet}
                                className={`flex items-center flex- gap-1 px-2 py-1 text-sm rounded-full text-success-700 bg-success-100`}
                            >
                                <DietaryIcon dietary={diet} size={28} />
                                <span>{c_T(`Dietary.${diet}`)}</span>
                            </div>
                        ))}
                    </div>
                </CustomAlert>
            )}
        </div>
    );
}; 