'use client';

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { isEqual } from 'lodash';

import { ProductData, ProductDataFull } from "@/lib/actions/product";
import { useSession } from "@/components/providers/session-provider";
import {
    Card,
    CardBody,
    CardHeader,
    Spacer,
    Switch
} from "@heroui/react";
import { RescueDealItem } from "@/components/settings/rescue-deal/rescue-item";
import { sortItems } from "@/lib/utils/helper/sort-items-with-order";
import { useProductDialog } from "@/components/providers/product-provider";
import {AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useStore } from "@/components/providers/store-provider";
import { logger } from "@/lib/logger";
import { RescueDealSchema, RescueDealType } from "@/lib/utils/schemas/rescue-schema";
import { saveRescueDeal, RescueDeal } from "@/lib/actions/rescue-deal";
import showErrorMessage from "@/components/toast/toast-error";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

interface RescueSettingsProps {
    productsData: ProductDataFull;
    productsOrder: Record<string, string[]>;
    initialRescueDeal: RescueDeal | null;
}

type RescueProductInForm = RescueDealType['products'][number];
type RescueDealInForm = Omit<RescueDealType, 'products'> & { products: RescueProductInForm[] };

const RescueSettings: React.FC<RescueSettingsProps> = ({ productsData, productsOrder, initialRescueDeal }) => {
    const t = useTranslations("app/(return_page)/settings/components/rescue-deal");
    const { setProductsDataLocal } = useProductDialog();
    const { registerSaveHandler, setSaveOpen, unregisterSaveHandler } = useSession();
    const { store } = useStore();
    const categoriesKeys = Object.keys(productsOrder);
    
    const [currentRescueDeal, setCurrentRescueDeal] = useState(initialRescueDeal);
    const [formIsDirty, setFormIsDirty] = useState(false);
    
    const allProducts = useMemo(() => Object.values(productsData || {}).sort((a,b) => a.id.localeCompare(b.id)), [productsData]);

    const defaultFormValues = useMemo(() => {
        const initialProducts = currentRescueDeal?.products || [];
        const formProducts = allProducts.map(product => {
            const initialProduct = initialProducts.find(p => p.id === product.id);
            if (initialProduct) {
                return initialProduct;
            }
            return { id: product.id, promotionPercent: 50, quantity: 1, isSelected: false };
        });

        return {
            isActive: currentRescueDeal?.isActive || false,
            products: formProducts
        };
    }, [allProducts, currentRescueDeal]);

    const form = useForm<RescueDealInForm>({
        defaultValues: defaultFormValues
    });

    const { control, watch, formState: { errors }, setValue, getValues, reset } = form;
    
    useEffect(() => {
        if (productsData) {
            setProductsDataLocal(productsData);
        }
    }, [productsData, setProductsDataLocal]);

    useEffect(() => {
        reset(defaultFormValues);
    }, [defaultFormValues, reset]);
    
    const handleSaveRescueDeal = useCallback(async () => {
        logger.debug('rescueSettings', 'save handler called');
        
        try {
            logger.debug('rescueSettings', 'saving rescue deal');
            const formData = getValues();
            
            const dataToSave = {
                isActive: formData.isActive,
                products: formData.products
            };

            const validation = RescueDealSchema.safeParse(dataToSave);

            if (!validation.success) {
                validation.error.issues.forEach((issue: any) => {
                    console.error('Validation error:', issue);
                });
                showErrorMessage({ error: t("validationError") || "Please check your inputs" });
                return false;
            }
            
            if (validation.data.products.length === 0 && validation.data.isActive) {
                showErrorMessage({ error: t("noProductsSelected") || "Please select at least one product" });
                return false;
            }
            
            const result = await saveRescueDeal(store.id, validation.data, currentRescueDeal?.id);
            
            if (!result.success) {
                showErrorMessage({ error: result.error || t("errorSavingRescueDeal") || "Failed to save rescue deal" });
                logger.error('rescueSettings', 'failed to save rescue deal', { error: result.error });
                return false;
            } else {
                logger.debug('rescueSettings', 'rescue deal saved successfully', { data: result.data });
                
                if (result.data) {
                    setCurrentRescueDeal(result.data);
                }
                
                setFormIsDirty(false); 
                setSaveOpen(false); 
                unregisterSaveHandler('rescue-deal');
                return true;
            }
        } catch (error) {
            logger.error('rescueSettings', 'error saving rescue deal', { error });
            showErrorMessage({ error: t("errorSavingRescueDeal") || "Failed to save rescue deal" });
            return false;
        }
    }, [getValues, store.id, currentRescueDeal, unregisterSaveHandler, setSaveOpen]);

    useEffect(() => {
        const subscription = watch((value) => {
            const isDirty = !isEqual(value, defaultFormValues);

            if (isDirty) {
                if (!formIsDirty) {
                    setFormIsDirty(true);
                }
                setSaveOpen(true);
                registerSaveHandler('rescue-deal', handleSaveRescueDeal);
            } else {
                if (formIsDirty) {
                    setFormIsDirty(false);
                    setSaveOpen(false);
                    unregisterSaveHandler('rescue-deal');
                }
            }
        });
        
        return () => subscription.unsubscribe();
    }, [watch, defaultFormValues, formIsDirty, setSaveOpen, registerSaveHandler, unregisterSaveHandler, handleSaveRescueDeal]);

    if (productsData === null || Object.keys(productsData || {}).length === 0) {
        return (
            <div className="text-center">
                <Spacer y={4} />
                <p className="text-2xl my-10">{t("noProductsYet") || "No products yet"}</p>
            </div>
        );
    }
    
    const productsArray: ProductData[] = Object.values(productsData || {});
    
    const productsByCategories: Record<string, ProductData[]> = productsArray.reduce((acc, product) => {
        if (!acc[product.category]) {
            acc[product.category] = [];
        }
        acc[product.category].push(product);
        return acc;
    }, {} as Record<string, ProductData[]>);

    const categories = sortItems(
        Object.keys(productsByCategories),
        categoriesKeys,
        (category) => category,
        (a, b) => a.localeCompare(b)
    );
    
    categoriesKeys.forEach((category) => {
        const orderForCategory: string[] = productsOrder[category] || [];
        if(productsByCategories[category]) {
            productsByCategories[category] = sortItems<ProductData>(
                productsByCategories[category],
                orderForCategory,
                (product) => product.id,
                (a, b) => a.name.localeCompare(b.name)
            );
        }
    });

    // State for product orders and tabs
    const [selectedTab, setSelectedTab] = useState(categories[0]);

    // Memoize the productsData for the selected tab
    const computedProductsData: ProductDataFull = useMemo(() => {
        return productsByCategories[selectedTab]?.reduce((acc, product) => {
            acc[product.id] = product;
            return acc;
        }, {} as ProductDataFull) || {};
    }, [productsByCategories, selectedTab]);




    useEffect(() => {
        logger.debug('rescueSettings', 'cleanup - component unmounting');
        
        return () => {
            logger.debug('rescueSettings', 'cleanup - component unmounting');
            unregisterSaveHandler('rescue-deal');
        };
    }, [unregisterSaveHandler]);
    
    return (
        <div>
            <Spacer y={8} />
            
            {/* Rescue Deal Description */}
            <Card shadow="none" className="w-full mb-6 bg-default-100">
                <CardBody>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-text">
                            {t("rescueDealTitle") || "What are Rescue Deals?"}
                        </h3>
                        <p className="text-sm text-default-600">
                            {t("rescueDealDescription") || "Rescue Deals automatically activate 45 minutes before your store closes, converting potential food waste into additional revenue. These discounted promotions help you sell items with short remaining shelf life while providing customers great value on quality products."}
                        </p>
                        <p className="text-sm text-default-600">
                            {t("rescueDealDescriptionH2") || "How it works: Use the menu below to select which items and quantities to include in your Rescue Deals. Set your discount percentage for each product category."}
                        </p>
                        <p className="text-sm text-default-600">
                            {t("rescueDealDescriptionH3") || "Important requirements: Only add items currently in stock with at least 12 hours of optimal consumption time remaining after purchase. All Rescue Deal sales are final with mandatory same-day pickup - no exceptions or refunds."}
                        </p>
                    </div>
                </CardBody>
            </Card>
            
            <Form {...form}>
                <form>
                    {/* Rescue Deal Settings Card */}
                    <Card shadow="none" className="w-full mb-6">
                        <CardBody className="space-y-6">

                            {/* Enable Rescue Deal Switch */}
                            <FormField
                                control={control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">
                                                {t("enableRescueDeal") || "Enable Rescue Deal"}
                                            </FormLabel>
                                            <p className="text-sm text-default-500">
                                                {t("enableRescueDealDescription") || "Activate rescue deals for eligible orders"}
                                            </p>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onValueChange={field.onChange}
                                                color="success"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardBody>
                    </Card>

                    <Spacer y={8} />

                    {/* Products Configuration */}
                    <Card shadow="none" className="w-full">
                        <CardHeader className={'pb-0 gap-x-4'}>
                                {categories.map((category) => (
                                        <motion.button
                                            key={category}
                                            type="button"
                                            layout="position"
                                            onPointerDown={() => {
                                                setSelectedTab(category);
                                            }}
                                            className={`text-sm relative ${selectedTab === category ? 'text-text font-medium' : 'text-default-500'}`}
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {`${category}`}
                                            <motion.div
                                                className="absolute bottom-0 left-0 right-0 h-[2px] bg-text"
                                                initial={false}
                                                animate={{
                                                    opacity: selectedTab === category ? 1 : 0,
                                                    scaleX: selectedTab === category ? 1 : 0
                                                }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                            />
                                        </motion.button>
                                ))}
                        </CardHeader>
                        <CardBody className={'flex'}>
                            <div className={'p-2 rounded-lg rounded-b-none bg-default-100 grid grid-cols-12 text-xs md:text-sm font-medium mb-4'}>
                                <span className="col-span-2">{t("image") || "Image"}</span>
                                <span className="col-span-4">{t("nameAndPrice") || "Name & Price"}</span>
                                <span className="col-span-2 text-center">{t("promotion") || "Promotion"}</span>
                                <span className="col-span-2 text-center">{t("quantity") || "Quantity"}</span>
                                <span className="col-span-2 text-center">{t("selections") || "Selections"}</span>
                            </div>
                            
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedTab}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    style={{ width: "100%" }}
                                >
                                    <RescueDealItem
                                        productsData={computedProductsData}
                                        setValue={setValue}
                                        watch={watch}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </CardBody>
                    </Card>
                    <Spacer y={8} />
                </form>
            </Form>
        </div>
    );
};

export default RescueSettings;