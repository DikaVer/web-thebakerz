/**
 * @fileoverview Section title headers with help buttons for the product editor form.
 *
 * Exports ProductTitleSection, DescriptionTitleSection,
 * IngredientsTitleSection, AllergiesTitleSection, DietaryTitleSection,
 * VariantsTitleSection, and VariantsInstructionSection. Each title component
 * renders a translated heading with a question-mark button that opens the
 * matching help modal from product-help-modal.tsx; the instruction section
 * renders static guidance for configuring product variants.
 */
import React, { useState } from 'react';
import { Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { ProductHelpModal, DescriptionHelpModal, IngredientsHelpModal, AllergiesHelpModal, DietaryHelpModal, VariantsHelpModal } from './product-help-modal';

interface ProductTitleSectionProps {
    isPending?: boolean;
}

export function DescriptionTitleSection() {
    const t = useTranslations("app/(store)/components/product-page");
    const [showDescriptionHelp, setShowDescriptionHelp] = useState(false);
    return (
        <>
            <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-base">{t("Description")}</span>
                <Button
                    aria-label="Description help"
                    isIconOnly
                    variant="light"
                    size="sm"
                    className="ml-1"
                    onPress={() => setShowDescriptionHelp(true)}
                >
                    <Icon icon="solar:question-circle-bold" width={18} />
                </Button>
            </div>
            <DescriptionHelpModal isOpen={showDescriptionHelp} onClose={() => setShowDescriptionHelp(false)} />
        </>
    );
}

export function IngredientsTitleSection() {
    const t = useTranslations("app/(store)/components/product-page");
    const [showIngredientsHelp, setShowIngredientsHelp] = useState(false);
    return (
        <>
            <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-base">{t("Ingredients")}</span>
                <Button
                    aria-label="Ingredients help"
                    isIconOnly
                    variant="light"
                    size="sm"
                    className="ml-1"
                    onPress={() => setShowIngredientsHelp(true)}
                >
                    <Icon icon="solar:question-circle-bold" width={18} />
                </Button>
            </div>
            <IngredientsHelpModal isOpen={showIngredientsHelp} onClose={() => setShowIngredientsHelp(false)} />
        </>
    );
}

export function AllergiesTitleSection() {
    const t = useTranslations("app/(store)/components/product-page");
    const [showAllergiesHelp, setShowAllergiesHelp] = useState(false);
    return (
        <>
            <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-base">{t("Allergies")}</span>
                <Button
                    aria-label="Allergies help"
                    isIconOnly
                    variant="light"
                    size="sm"
                    className="ml-1"
                    onPress={() => setShowAllergiesHelp(true)}
                >
                    <Icon icon="solar:question-circle-bold" width={18} />
                </Button>
            </div>
            <AllergiesHelpModal isOpen={showAllergiesHelp} onClose={() => setShowAllergiesHelp(false)} />
        </>
    );
}

export function DietaryTitleSection() {
    const t = useTranslations("app/(store)/components/product-page");
    const [showDietaryHelp, setShowDietaryHelp] = useState(false);
    return (
        <>
            <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-base">{t("Dietary Restrictions")}</span>
                <Button
                    aria-label="Dietary help"
                    isIconOnly
                    variant="light"
                    size="sm"
                    className="ml-1"
                    onPress={() => setShowDietaryHelp(true)}
                >
                    <Icon icon="solar:question-circle-bold" width={18} />
                </Button>
            </div>
            <DietaryHelpModal isOpen={showDietaryHelp} onClose={() => setShowDietaryHelp(false)} />
        </>
    );
}


export function VariantsTitleSection() {
    const t = useTranslations("app/(store)/components/product-page");
    const [showVariantsHelp, setShowVariantsHelp] = useState(false);
    return (
        <> 
            <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-base">{t("Item Options")}</span>
                <Button
                    aria-label="Item options help"
                    isIconOnly
                    variant="light"
                    size="sm"
                    className="ml-1"
                    onPress={() => setShowVariantsHelp(true)}
                                    >
                                        <Icon icon="solar:question-circle-bold" width={20} />
                                    </Button>
                                </div>
            <VariantsHelpModal isOpen={showVariantsHelp} onClose={() => setShowVariantsHelp(false)} />
        </>
    );
}

export function VariantsInstructionSection() {
    const t = useTranslations("app/(store)/components/variants-form-field");
    return (
        <div className="bg-default-50 rounded-lg p-4 mb-2 space-y-3 border border-default-200">
            <h4 className="font-semibold text-base mb-1">{t("instructionsHeader")}</h4>
            <div>
                <h5 className="font-medium text-sm mb-1">{t("singleChoice")}</h5>
                <p className="text-xs text-default-600 mb-2">{t("singleChoiceInstruction")}</p>
            </div>
            <div>
                <h5 className="font-medium text-sm mb-1">{t("multipleChoices")}</h5>
                <p className="text-xs text-default-600 mb-2">{t("multipleChoicesInstruction")}</p>
            </div>
            <div>
                <h5 className="font-medium text-sm mb-1">{t("required")}</h5>
                <p className="text-xs text-default-600 mb-2">{t("requiredInstruction")}</p>
            </div>
            <div>
                <h5 className="font-medium text-sm mb-1">{t("minSelections")}</h5>
                <p className="text-xs text-default-600 mb-2">{t("minSelectionsInstruction")}</p>
            </div>
            <div>
                <h5 className="font-medium text-sm mb-1">{t("maxSelections")}</h5>
                <p className="text-xs text-default-600 mb-2">{t("maxSelectionsInstruction")}</p>
            </div>
            <div>
                <h5 className="font-medium text-sm mb-1">{t("exampleHeader")}</h5>
                <ul className="list-disc pl-5 text-xs text-default-600">
                    <li>{t("exampleSingle")}</li>
                    <li>{t("exampleMultiple")}</li>
                    <li>{t("exampleRequired")}</li>
                    <li>{t("exampleMinMax")}</li>
                </ul>
            </div>
        </div>
    );
}

export function ProductTitleSection({ isPending }: ProductTitleSectionProps) {
    const t = useTranslations("app/(store)/components/product-page");
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    return (
        <>
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-2xl font-bold">{t("Basic Information")} </h2>
                    <p className="text-default-600 font-light">{t("Enter the essential details of your product")}</p>
                </div>
                <Tooltip content={t("Needhelp")}>
                    <Button
                        aria-label="Help"
                        isIconOnly
                        variant="light"
                        onPress={() => setIsHelpOpen(true)}
                        isDisabled={isPending}
                    >
                        <Icon icon="solar:question-circle-bold" width={24} />
                    </Button>
                </Tooltip>
            </div>
            <ProductHelpModal
                isOpen={isHelpOpen}
                onClose={() => setIsHelpOpen(false)}
            />
        </>
    );
} 