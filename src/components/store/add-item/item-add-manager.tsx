/**
 * @fileoverview Client component that manages the store owner's product catalog listing.
 *
 * Groups the store's products by category, sorts them according to the saved
 * category and product order, and renders them as animated, drag-scrollable
 * category tabs backed by ItemTable. Also shows an "add item" button that
 * navigates to the product creation page, and syncs the loaded product data
 * into the product dialog provider.
 */
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
                    aria-label="Add item"
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
                (product) => product.id,
                (a, b) => a.name.localeCompare(b.name)
            );
        }
    });

     // State for product orders and tabs
     const [selectedTab, setSelectedTab] = useState(categories[0]);
    
     // Drag scroll functionality
     const [isDragging, setIsDragging] = useState(false);
     const [startX, setStartX] = useState(0);
     const [scrollLeft, setScrollLeft] = useState(0);
     const scrollContainerRef = React.useRef<HTMLDivElement>(null);
 
     // Drag scroll handlers
     const handleMouseDown = (e: React.MouseEvent) => {
         if (!scrollContainerRef.current) return;
         setIsDragging(true);
         setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
         setScrollLeft(scrollContainerRef.current.scrollLeft);
     };
 
     const handleMouseMove = (e: React.MouseEvent) => {
         if (!isDragging || !scrollContainerRef.current) return;
         e.preventDefault();
         const x = e.pageX - scrollContainerRef.current.offsetLeft;
         const walk = (x - startX) * 2; // Scroll speed
         scrollContainerRef.current.scrollLeft = scrollLeft - walk;
     };
 
     const handleMouseUp = () => {
         setIsDragging(false);
     };
 
     const handleMouseLeave = () => {
         setIsDragging(false);
     };
 
     const handleCategoryClick = (category: string, e: React.MouseEvent) => {
         // Only change tab if we're not dragging
         if (!isDragging) {
             setSelectedTab(category);
         }
         e.preventDefault();
     };

    // Memoize the productsData for the selected tab so that it recomputes when selectedTab or productOrders change
    const computedProductsData: ProductDataFull = useMemo(() => {
        return productsByCategories[selectedTab]?.reduce((acc, product) => {
            acc[product.id] = product;
            return acc;
        }, {} as ProductDataFull) || {};
    }, [productsByCategories, selectedTab]);



    return (
        <div>
            <Spacer y={8} />
            <div className={'flex justify-between'}>
                <Button
                    aria-label="Add item"
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
                    <div 
                        ref={scrollContainerRef}
                        className="flex gap-x-4 overflow-x-auto scrollbar-hide w-full cursor-grab active:cursor-grabbing select-none"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
                    >
                        {categories.map((category) => (
                                <motion.button
                                    key={category}
                                    type="button"
                                    layout="position"
                                    onMouseDown={(e) => handleCategoryClick(category, e)}
                                    className={`text-sm relative whitespace-nowrap flex-shrink-0 py-2 pointer-events-auto ${selectedTab === category ? 'text-text font-medium' : 'text-default-500'}`}
                                    whileHover={!isDragging ? { scale: 1.05 } : {}}
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
                    </div>
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