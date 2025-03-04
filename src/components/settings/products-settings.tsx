'use client';

import React, { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentProducts, ProductData, ProductDataFull } from "@/lib/actions/product";
import { useSession } from "@/components/providers/session-provider";
import NotFound from "@/app/not-found";
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Spacer,
    Tab,
    Tabs
} from "@heroui/react";
import { ProductTable } from "@/components/settings/products/product-tab";
import { sortItems } from "@/lib/helper/sort-items-with-order";
import { Icon } from "@iconify/react";
import { useProductDialog } from "@/components/providers/product-provider";
import {AnimatePresence, motion, Reorder } from "framer-motion";
import { ItemCategory } from "../ui/drag-item";

const ProductManager: React.FC<{ productsData: ProductDataFull }> = ({ productsData }) => {
    const { handleOpen, setProductsDataLocal } = useProductDialog();

    useEffect(() => {
        if (productsData) {
            setProductsDataLocal(productsData);
        }
    }, [productsData]);

    if (productsData === null || Object.keys(productsData || {}).length === 0) {
        return (
            <div className="text-center">
                <p className="text-2xl my-10">Store does not have any products yet.</p>
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

    // Sort the category keys based on the defined order.
    const sortedCategoryKeys = sortItems<string>(
        Object.keys(productsByCategories),
        ["Eclairs", "Macarons"],
        (category) => category,
        (a, b) => a.localeCompare(b)
    );


    // Sort each category's products (fallback to alphabetical)
    sortedCategoryKeys.forEach((category) => {
        const orderForCategory: string[] = [];
        productsByCategories[category] = sortItems<ProductData>(
            productsByCategories[category],
            orderForCategory,
            (product) => product.constId,
            (a, b) => a.name.localeCompare(b.name)
        );
    });

    // State for product orders and tabs
    const [tabs, setTabs] = useState<string[]>(sortedCategoryKeys);
    const [selectedTab, setSelectedTab] = useState(tabs[0]);


    // Memoize the productsData for the selected tab so that it recomputes when selectedTab or productOrders change
    const computedProductsData: ProductDataFull = useMemo(() => {
        return productsByCategories[selectedTab]?.reduce((acc, product) => {
            acc[product.constId] = product;
            return acc;
        }, {} as ProductDataFull) || {};
    }, [productsByCategories, selectedTab]);

    const [orderPayload, setOrderPayload] = useState<Record<string, string[]>>({});

    const updateOrder = (category: string, order: string[]) => {
        setOrderPayload(prev => ({...prev, [category]: order}));
    };

    // Function to save the current order (unchanged here)
    const handleSaveOrder = async () => {
        console.log(orderPayload)

        console.log(tabs);
        // Save via fetch...
    };

    return (
        <div>
            <div className={'flex justify-between'}>
                <div>
                    <p className="text-base font-medium text-default-700">Product Manager</p>
                    <p className="mt-1 text-sm font-normal text-default-400">
                        Add & Manage your products
                    </p>
                </div>
                <Button
                    className="w-[150px] h-12 justify-start bg-gradient-primary text-white font-medium"
                    startContent={
                        <Icon icon="solar:add-square-broken" width={24} className="text-white" />
                    }
                    onPress={() => {
                        handleOpen();
                    }}
                >
                    Add Item
                </Button>
            </div>
            <Spacer y={4} />

            <Card className="w-full" shadow={'sm'}>
                <CardHeader className={'pb-0'}>
                    <Reorder.Group
                        axis="x"
                        onReorder={setTabs}
                        className='flex-grow flex justify-start items-end space-x-2 w-full'
                        values={tabs}
                    >
                        {tabs.map((category) => (
                            <ItemCategory item={category} key={category}>
                                <motion.button
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
                            </ItemCategory>
                        ))}
                    </Reorder.Group>
                </CardHeader>
                <CardBody className={'flex'}>
                    <div
                        className="rounded-lg rounded-b-none bg-default-100 cursor-pointer grid grid-cols-6 p-2 gap-x-4 text-sm font-light"
                    >
                        <span>Image</span>
                        <span className={'flex col-span-3'}>Name</span>
                        <span>Price</span>
                        <span>Drag</span>
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
                            <ProductTable
                                key={selectedTab}
                                category={selectedTab}
                                productsData={computedProductsData}
                                updateOrder={updateOrder}
                            />
                        </motion.div>
                    </AnimatePresence>
                </CardBody>
                <CardFooter>
                    <Button
                        fullWidth
                        startContent={<Icon icon={"solar:reorder-linear"} width={24} />}
                        onPress={handleSaveOrder}
                        color={'secondary'}
                    >
                        Update Product Order in every Category
                    </Button>
                </CardFooter>
            </Card>
            <Spacer y={8} />
        </div>
    );
};

export default ProductManager;
