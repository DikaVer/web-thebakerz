/**
 * @fileoverview Client component showing the categorized product picker in the store order flow.
 *
 * Groups the store's products by category, sorts categories and products
 * according to the saved order, and renders animated category tabs whose
 * contents are ProductItems rows. Hidden once the checkout flow moves past
 * the cart step, and syncs product data into the product dialog provider.
 */
'use client';

import React, { useEffect, useState, useMemo } from "react";
import { ProductData, ProductDataFull } from "@/lib/actions/product";
import {
    Card,
    CardBody,
    CardHeader,
    Spacer,
} from "@heroui/react";
import { sortItems } from "@/lib/utils/helper/sort-items-with-order";
import { useProductDialog } from "@/components/providers/product-provider";
import {AnimatePresence, motion} from "framer-motion";
import {ProductItems} from "@/components/store/orders/add/product-item";
import {useTranslations} from "next-intl";

interface ProductListProps {
    productsData: ProductDataFull;
    productsOrder: Record<string, string[]>;
    currentStep: number;
}

const ProductList: React.FC<ProductListProps> = ({currentStep, productsData, productsOrder }) => {
    const { setProductsDataLocal } = useProductDialog();
    const categoriesKeys = Object.keys(productsOrder);
    const t = useTranslations("app/(store)/components/orders/add");

    useEffect(() => {
        if (productsData) {
            setProductsDataLocal(productsData);
        }
    }, [productsData]);

    if (productsData === null || Object.keys(productsData || {}).length === 0) {
        return (
            <div className="text-center">
                <p className="text-2xl my-10">{t("noProductsAvailable")}</p>
            </div>
        );
    }

    // Convert the object to an array before categorizing
    const productsArray: ProductData[] = Object.values(productsData || {});


    // Categorize products by their category
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
    )



    // Sort each category's products (fallback to alphabetical)
    categoriesKeys.forEach((category) => {
        const orderForCategory: string[] = productsOrder[category] || [];
        if(productsOrder[category] && productsByCategories[category]) {
            productsByCategories[category] = sortItems<ProductData>(
                productsByCategories[category],
                orderForCategory,
                (product) => product.id,
                (a, b) => a.name.localeCompare(b.name)
            );
        }
    });

    // State for product orders and tabs
    const [tabs, setTabs] = useState<string[]>(categories);
    const [selectedTab, setSelectedTab] = useState(tabs[0]);


    // Memoize the productsData for the selected tab so that it recomputes when selectedTab or productOrders change
    const computedProductsData: ProductDataFull = useMemo(() => {
        return productsByCategories[selectedTab]?.reduce((acc, product) => {
            acc[product.id] = product;
            return acc;
        }, {} as ProductDataFull) || {};

    }, [productsByCategories, selectedTab]);




    return (
        <div className={`${(currentStep === 0 || currentStep > 1) && 'hidden'}`}>
            <div className={'flex justify-between'}>
                <div>
                    <p className="text-base font-medium text-default-700">{t("customerCart")}</p>
                    <p className="mt-1 text-sm font-normal text-default-400">
                        {t("addManageCart")}
                    </p>
                </div>
            </div>
            <Spacer y={4} />

            <Card shadow="none" className="w-full" >
                <CardHeader className={'pb-0 space-x-4'}>
                    {tabs.map((category) => (
                        <motion.button
                            key={category}
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
                    <div className={'p-2 rounded-lg rounded-b-none bg-default-100 grid grid-cols-6 text-xs md:text-sm font-medium'}>
                        <div
                            className=" col-span-5  grid grid-cols-5 gap-x-4"
                        >
                            <span>{t("image")}</span>
                            <span className={'flex col-span-4'}>{t("namePrice")}</span>
                        </div>
                        <span
                            className={'text-center'}
                        >{t("add")}</span>
                    </div>
                    {/* Use a key prop so that the ProductTable re-mounts when the selectedTab changes */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            style={{ width: "100%" }}
                        >
                            <ProductItems
                                key={selectedTab}
                                category={selectedTab}
                                productsData={computedProductsData}
                            />
                        </motion.div>
                    </AnimatePresence>
                </CardBody>
            </Card>

            <Spacer y={8} />
        </div>
    );
};

export default ProductList;