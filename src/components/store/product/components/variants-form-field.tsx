/**
 * @fileoverview Form field for editing product variant option groups in the
 * business dashboard product editor.
 *
 * Exports the VariantsFormField client component, which plugs into a
 * react-hook-form instance typed by ProductSchema and lets store owners add,
 * expand, and remove option groups, toggle single/multiple choice and required
 * flags, set min/max selection counts, and manage per-option labels and price
 * adjustments with animated Hero UI inputs.
 */
'use client';
import React, {useEffect, useState} from "react";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import {
    Input,
    Button,
    Switch,
    Select,
    SelectItem,
    NumberInput
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {UseFormReturn} from "react-hook-form";
import {ProductSchema} from "@/lib/utils/schemas";
import {z} from "zod";

export const VariantsFormField = ({ form, isPending } : {form: UseFormReturn<z.infer<typeof ProductSchema>>, isPending: boolean}) => {
    const t = useTranslations("app/(store)/components/variants-form-field");
    const [expandedVariants, setExpandedVariants] = useState<number[]>([]);

    const toggleVariantExpand = (index: number) => {
        if (expandedVariants.includes(index)) {
            setExpandedVariants(expandedVariants.filter(i => i !== index));
        } else {
            setExpandedVariants([...expandedVariants, index]);
        }
    };

    const addVariant = () => {
        const currentVariants = form.getValues("variants") || [];
        const newVariant = {
            label: "",
            isSingle: true,
            required: false,
            options: [{ label: "", price: 0 }]
        };
        form.setValue("variants", [...currentVariants, newVariant]);
        setExpandedVariants([...expandedVariants, currentVariants.length]);
    };

    const removeVariant = (index: number) => {
        const currentVariants = form.getValues("variants") || [];
        form.setValue("variants", currentVariants.filter((_: any, i: number) => i !== index));
        setExpandedVariants(expandedVariants
            .filter(i => i !== index)
            .map(i => i > index ? i - 1 : i));
    };

    const addOption = (variantIndex: number) => {
        const currentVariants = form.getValues("variants") || [];
        if (!currentVariants[variantIndex]) return;
        const currentOptions = currentVariants[variantIndex].options || [];
        const updatedVariant = {
            ...currentVariants[variantIndex],
            options: [...currentOptions, { label: "", price: 0 }]
        };
        const updatedVariants = [...currentVariants];
        updatedVariants[variantIndex] = updatedVariant;
        form.setValue("variants", updatedVariants);
    };

    const removeOption = (variantIndex: number, optionIndex: number) => {
        const currentVariants = form.getValues("variants") || [];
        if (!currentVariants[variantIndex]) return;
        const currentOptions = currentVariants[variantIndex].options || [];
        const updatedOptions = currentOptions.filter((_: any, i: number) => i !== optionIndex);
        const updatedVariant = {
            ...currentVariants[variantIndex],
            options: updatedOptions
        };
        const updatedVariants = [...currentVariants];
        updatedVariants[variantIndex] = updatedVariant;
        form.setValue("variants", updatedVariants);
    };

    // It is not a joke
    const animals = [
        {key: "1", label: "1"},
        {key: "2", label: "2"},
        {key: "3", label: "3"},
        {key: "4", label: "4"},
        {key: "5", label: "5"},
        {key: "6", label: "6"},
        {key: "7", label: "7"},
        {key: "8", label: "8"},
        {key: "9", label: "9"}
    ];

    return (
        <div>
            <FormField
                control={form.control}
                name="variants"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormControl>
                            <div className="space-y-6">
                                {fieldState.error && (
                                    <p className="text-danger-500 text-lg mt-1">{fieldState.error.message}</p>
                                )}
                                {/* Option Groups */}
                                {(Array.isArray(field.value) ? field.value : []).map((variant: { label: string; isSingle: boolean; required: boolean; options: any[]; maxSelections?: number; minSelections?: number }, variantIndex: number) => (
                                    <motion.div
                                        key={variantIndex}
                                        className="border border-default-200 rounded-lg bg-default-100/50 mb-6 bg-white"
                                        initial={{ opacity: 0, y: -10, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.97 }}
                                        transition={{ type: "spring", damping: 15, stiffness: 200 }}
                                        layout
                                    >
                                        <div className="flex justify-between items-center px-4 py-3 cursor-pointer border-b border-default-200 rounded-t-lg bg-default-100/80">
                                            <div>
                                                <h3 className="font-extrabold text-lg">{variant.label || t("newOption")}</h3>
                                                
                                            </div>
                                            <div className="flex space-x-2">
                                                <motion.div
                                                    initial={false}
                                                    animate={{ rotate: expandedVariants.includes(variantIndex) ? 180 : 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <Button
                                                        aria-label="Expand variant"            
                                                        isIconOnly
                                                        size="sm"
                                                        variant="light"
                                                        onPress={(e) => {
                                                            toggleVariantExpand(variantIndex);
                                                        }}
                                                        isDisabled={isPending}
                                                    >
                                                        <Icon icon="mdi:chevron-down" width={20} />
                                                    </Button>
                                                </motion.div>
                                                <Button
                                                    aria-label="Remove variant"
                                                    isIconOnly
                                                    size="sm"
                                                    color="danger"
                                                    variant="light"
                                                    onPress={() => removeVariant(variantIndex)}
                                                    isDisabled={isPending}
                                                >
                                                    <Icon icon="mdi:close" width={20} />
                                                </Button>
                                            </div>
                                        </div>
                                        <AnimatePresence>
                                            {expandedVariants.includes(variantIndex) && (
                                                <div className="p-4 space-y-4">
                                                    {/* Option Group Name */}
                                                    <div>
                                                        <Input
                                                            label={t("optionGroupName")}
                                                            placeholder={t("placeholder")}
                                                            value={variant.label}
                                                            onChange={(e) => {
                                                                //@ts-ignore
                                                                const updatedVariants = [...field.value];
                                                                updatedVariants[variantIndex].label = e.target.value;
                                                                field.onChange(updatedVariants);
                                                            }}
                                                            isRequired
                                                            validate={()=> {
                                                                //@ts-ignore
                                                                if(fieldState?.error && fieldState.error[variantIndex] !== undefined) {
                                                                    //@ts-ignore
                                                                    return fieldState?.error[variantIndex].label?.message
                                                                }
                                                            }}
                                                            variant={'underlined'}
                                                            isDisabled={isPending}
                                                        />
                                                        <p className="text-xs text-default-400 mt-1">{t("optionGroupNameHelp")}</p>
                                                    </div>
                                                    {/* Variant Configuration */}
                                                    <div className="flex flex-wrap items-center gap-6 bg-default-50 rounded-md p-3">
                                                        <div className="flex items-center space-x-2">
                                                            <Switch
                                                                isSelected={!variant.isSingle}
                                                                onValueChange={(isMultiple) => {
                                                                    //@ts-ignore
                                                                    const updatedVariants = [...field.value];
                                                                    updatedVariants[variantIndex].isSingle = !isMultiple;
                                                                    field.onChange(updatedVariants);
                                                                }}
                                                                size="sm"
                                                                isDisabled={isPending}
                                                            />
                                                            <span className="text-sm font-medium">
                                                                {variant.isSingle ? t("singleChoice") : t("multipleChoices")}
                                                            </span>
                                                            <span className="text-xs text-default-400 ml-2">{variant.isSingle ? t("singleChoiceHelp") : t("multipleChoicesHelp")}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Switch
                                                                isSelected={variant.required}
                                                                onValueChange={(isRequired) => {
                                                                    const updatedVariants = [...field.value];
                                                                    updatedVariants[variantIndex].required = isRequired;
                                                                    field.onChange(updatedVariants);
                                                                }}
                                                                size="sm"
                                                                isDisabled={isPending}
                                                            />
                                                            <span className="text-sm font-medium">{t("required")}</span>
                                                            <span className="text-xs text-default-400 ml-2">{t("requiredHelp")}</span>
                                                        </div>
                                                        {(!variant.isSingle && variant.required) && (
                                                            <Select
                                                                label={t("minSelections")}
                                                                className="max-w-xs"
                                                                size="sm"
                                                                variant={'underlined'}
                                                                selectedKeys={[`${variant.minSelections}`]}
                                                                onChange={(e) => {
                                                                    //@ts-ignore
                                                                    const updatedVariants = [...field.value];
                                                                    updatedVariants[variantIndex].minSelections = Number(e.target.value);
                                                                    field.onChange(updatedVariants);
                                                                }}
                                                                isDisabled={isPending}
                                                                validate={()=> {
                                                                    //@ts-ignore
                                                                    if(fieldState?.error && fieldState.error[variantIndex] !== undefined) {
                                                                        //@ts-ignore
                                                                        return fieldState?.error[variantIndex].maxSelections?.message
                                                                    }
                                                                }}
                                                            >
                                                                {animals.map((animal) => (
                                                                    <SelectItem key={animal.key}>{animal.label}</SelectItem>
                                                                ))}
                                                            </Select>
                                                        )}
                                                        {!variant.isSingle && (
                                                            <Select
                                                                label={t("maxSelections")}
                                                                className="max-w-xs"
                                                                size="sm"
                                                                variant={'underlined'}
                                                                selectedKeys={[`${variant.maxSelections}`]}
                                                                onChange={(e) => {
                                                                    //@ts-ignore
                                                                    const updatedVariants = [...field.value];
                                                                    updatedVariants[variantIndex].maxSelections = Number(e.target.value);
                                                                    field.onChange(updatedVariants);
                                                                }}
                                                                isDisabled={isPending}
                                                                validate={()=> {
                                                                    //@ts-ignore
                                                                    if(fieldState?.error && fieldState.error[variantIndex] !== undefined) {
                                                                        //@ts-ignore
                                                                        return fieldState?.error[variantIndex].maxSelections?.message
                                                                    }
                                                                }}
                                                            >
                                                                {animals.map((animal) => (
                                                                    <SelectItem key={animal.key}>{animal.label}</SelectItem>
                                                                ))}
                                                            </Select>
                                                        )}
                                                    </div>
                                                    {/* Options */}
                                                    <div className="space-y-2 mt-4 pr-2">
                                                        <h4 className="text-sm font-medium mb-1">{t("options")}</h4>
                                                        <p className="text-xs text-default-400 mb-2">{t("optionsHelp")}</p>
                                                        <AnimatePresence>
                                                            {variant.options.map((option: { label: string; price: number }, optionIndex: number) => (
                                                                <motion.div
                                                                    key={optionIndex}
                                                                    className="flex items-center gap-2 bg-white border border-default-200 rounded-md p-2 mb-2"
                                                                    initial={{ opacity: 0, y: -10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
                                                                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                                                                >
                                                                    <Input
                                                                        aria-label="Option name"
                                                                        placeholder={t("optionName")}
                                                                        value={option.label}
                                                                        onChange={(e) => {
                                                                            const updatedVariants = [...field.value];
                                                                            updatedVariants[variantIndex].options[optionIndex].label = e.target.value;
                                                                            field.onChange(updatedVariants);
                                                                        }}
                                                                        variant={"underlined"}
                                                                        classNames={{
                                                                            mainWrapper: "my-2",
                                                                            inputWrapper: "h-12"
                                                                        }}
                                                                        validate={()=> {
                                                                            if(checkFieldError(fieldState, variantIndex, optionIndex, 'options')) {
                                                                                //@ts-ignore
                                                                                return fieldState?.error[variantIndex]['options'][optionIndex].label?.message
                                                                            }
                                                                        }}
                                                                        isRequired
                                                                        className="flex-1"
                                                                        size="sm"
                                                                        isDisabled={isPending}
                                                                    />
                                                                    <NumberInput
                                                                        aria-label="Price"
                                                                        placeholder="0.00"
                                                                        value={option.price}
                                                                        onChange={(val) => {
                                                                            const updatedVariants = [...field.value];
                                                                            const price = typeof val === 'number' ? val : parseFloat(val.target.value);
                                                                            updatedVariants[variantIndex].options[optionIndex].price = price ;
                                                                            field.onChange(updatedVariants);
                                                                        }}
                                                                        validate={()=> {
                                                                            if(checkFieldError(fieldState, variantIndex, optionIndex, 'options')) {
                                                                                //@ts-ignore
                                                                                return fieldState?.error[variantIndex]['options'][optionIndex].price?.message
                                                                            }
                                                                        }}
                                                                        isRequired
                                                                        variant={"underlined"}
                                                                        startContent={
                                                                            <div className="pointer-events-none flex items-center">
                                                                                <span className="text-default-400">€</span>
                                                                            </div>
                                                                        }
                                                                        size="sm"
                                                                        className="w-24"
                                                                        isDisabled={isPending}
                                                                    />
                                                                    {optionIndex > 0 && (
                                                                        <motion.div
                                                                            whileHover={{ scale: 1.1 }}
                                                                            whileTap={{ scale: 0.95 }}
                                                                        >
                                                                            <Button
                                                                                aria-label="Remove option"
                                                                                isIconOnly
                                                                                size="sm"
                                                                                color="danger"
                                                                                variant="light"
                                                                                onPress={() => removeOption(variantIndex, optionIndex)}
                                                                                isDisabled={isPending}
                                                                            >
                                                                                <Icon icon="mdi:close" width={16} />
                                                                            </Button>
                                                                        </motion.div>
                                                                    )}
                                                                </motion.div>
                                                            ))}
                                                        </AnimatePresence>
                                                        <motion.div
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <Button
                                                                aria-label="Add option"
                                                                size="sm"
                                                                variant="flat"
                                                                onPress={() => addOption(variantIndex)}
                                                                isDisabled={isPending}
                                                                className="mt-2"
                                                            >
                                                                <Icon icon="mdi:plus" className="mr-1" width={16} />
                                                                {t("addOption")}
                                                            </Button>
                                                        </motion.div>
                                                    </div>
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                                {/* Add Option Group Button */}
                                <div className="flex justify-end">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button
                                            aria-label="Add option group"
                                            variant="flat"
                                            color="primary"
                                            onPress={addVariant}
                                            className="text-black dark:text-white"
                                            isDisabled={isPending}
                                            endContent={<Icon icon="material-symbols:add-rounded" width={24}/>}>
                                            {t("addOptionGroup")}
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        </FormControl>
                    </FormItem>
                )}
            />
        </div>
    );
};


const checkFieldError = (fieldState: any, index: number, key: number, label: string) => {
    return fieldState?.error && fieldState.error[index] !== undefined && fieldState.error[index][label] !== undefined && fieldState.error[index][label][key] !== undefined
}