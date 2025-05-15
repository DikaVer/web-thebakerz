'use client';

import React, { useEffect, useState, useMemo } from "react";
import { ProductData, ProductDataFull } from "@/lib/actions/product";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Spacer,
} from "@heroui/react";
import { ProductTable } from "@/components/settings/products/product-tab";
import { sortItems } from "@/lib/utils/helper/sort-items-with-order";
import { Icon } from "@iconify/react";
import { useProductDialog } from "@/components/providers/product-provider";
import {AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ItemTable } from "./item-table";
import { useRouter } from "next/navigation";
import { useStore } from "@/components/providers/store-provider";


const ItemAddManager: React.FC<{ productsData: ProductDataFull; productsOrder: Record<string, string[]>}> = ({ productsData, productsOrder }) => {
    const t = useTranslations("app/(return_page)/settings/components/item-add-manager");
    const { setProductsDataLocal } = useProductDialog();
    const { store } = useStore();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const categoriesKeys = Object.keys(productsOrder);

    useEffect(() => {
        if (productsData) {
            setProductsDataLocal(productsData);
        }
    }, [productsData]);

    if (productsData === null || Object.keys(productsData || {}).length === 0) {
        return (
            <div className="text-center">
                <Spacer y={8} />
                <Button
                    className="w-full h-12 bg-gradient-primary text-white font-medium"
                    isLoading={isLoading}
                    endContent={
                        <Icon icon="solar:arrow-right-up-linear" width={24} className="text-white" />
                    }
                    onPress={() => {
                        setIsLoading(true);
                        router.push(`/${store?.storeName || store?.id}/item/add-item/new`);
                    }}
                >
                    {t("addItem")}
                </Button>
                <Spacer y={4} />
                <p className="text-2xl my-10">{t("noProductsYet")}</p>
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
        if(productsByCategories[category]) {
            productsByCategories[category] = sortItems<ProductData>(
                productsByCategories[category],
                orderForCategory,
                (product) => product.constId,
                (a, b) => a.name.localeCompare(b.name)
            );
        }
    });

    // State for product orders and tabs
    const [selectedTab, setSelectedTab] = useState(categories[0]);

    // Memoize the productsData for the selected tab so that it recomputes when selectedTab or productOrders change
    const computedProductsData: ProductDataFull = useMemo(() => {
        return productsByCategories[selectedTab]?.reduce((acc, product) => {
            acc[product.constId] = product;
            return acc;
        }, {} as ProductDataFull) || {};
    }, [productsByCategories, selectedTab]);



    return (
        <div>
            <Spacer y={8} />
            <div className={'flex justify-between'}>
                <Button
                    className="w-full h-12 bg-gradient-primary text-white font-medium"
                    isLoading={isLoading}
                    endContent={
                        <Icon icon="solar:arrow-right-up-linear" width={24} className="text-white" />
                    }
                    onPress={() => {
                        if (!isLoading) {
                            setIsLoading(true);
                            router.push(`/${store?.storeName || store?.id}/item/add-item/new`);
                        }
                    }}
                >
                    {t("addItem")}
                </Button>
            </div>
            <Spacer y={4} />

            <Card shadow="none" className="w-full" >
                <CardHeader className={'pb-0 gap-x-4'}>
                        {categories.map((category) => (
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
                            <ItemTable
                                key={selectedTab}
                                category={selectedTab}
                                productsData={computedProductsData}
                                isLoading={isLoading}
                                setIsLoading={setIsLoading}
                            />
                        </motion.div>
                    </AnimatePresence>
                </CardBody>
            </Card>
            <Spacer y={8} />
        </div>
    );
};

export default ItemAddManager;