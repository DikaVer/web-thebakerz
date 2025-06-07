'use client';

import React, { useEffect, useState, useMemo } from "react";

import { ProductData, ProductDataFull } from "@/lib/actions/product";
import { useSession } from "@/components/providers/session-provider";
import {
    Card,
    CardBody,
    CardHeader,
    Spacer,
} from "@heroui/react";
import { ProductTable } from "@/components/settings/products/product-tab";
import { sortItems } from "@/lib/utils/helper/sort-items-with-order";
import { useProductDialog } from "@/components/providers/product-provider";
import {AnimatePresence, motion, Reorder } from "framer-motion";
import { ItemCategory } from "../ui/drag-item";
import {updateProductsOrder} from "@/lib/actions/order-products";
import showErrorMessage from "@/components/toast/toast-error";
import { useTranslations } from "next-intl";
import {useStore} from "@/components/providers/store-provider";
import { logger } from "@/lib/logger";

const ProductManager: React.FC<{ productsData: ProductDataFull; productsOrder: Record<string, string[]>}> = ({ productsData, productsOrder }) => {
    const t = useTranslations("app/(return_page)/settings/components/products-settings");
    const { setProductsDataLocal } = useProductDialog();
    const { registerSaveHandler, setSaveOpen } = useSession();
    const [orderChanged, setOrderChanged] = useState(false);
    const categoriesKeys = Object.keys(productsOrder);
    const { store } = useStore();

    useEffect(() => {
        if (productsData) {
            setProductsDataLocal(productsData);
        }
    }, [productsData]);

    if (productsData === null || Object.keys(productsData || {}).length === 0) {
        return (
            <div className="text-center">
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
    );

    // State for product orders and tabs
    const [tabs, setTabs] = useState<string[]>(categories);
    const [selectedTab, setSelectedTab] = useState(tabs[0]);
    
    // Initialize orderPayload once with the initial productsOrder
    const [orderPayload, setOrderPayload] = useState<Record<string, string[]>>(() => {
        // Create a deep copy of the productsOrder to avoid reference issues
        const initialOrderPayload = {...productsOrder};
        
        // Ensure all categories have an order array
        categories.forEach(category => {
            if (!initialOrderPayload[category]) {
                initialOrderPayload[category] = [];
            }
            
            // For each category, if there's no order defined or it's incomplete,
            // initialize it with the product IDs in that category
            if (productsByCategories[category]) {
                const productIds = productsByCategories[category].map(product => product.id);
                
                // If the order array is empty or doesn't contain all product IDs,
                // initialize it with the current product order
                if (!initialOrderPayload[category].length || 
                    !productIds.every(id => initialOrderPayload[category].includes(id))) {
                    // Keep existing order and add any missing products
                    const existingOrderedIds = initialOrderPayload[category] || [];
                    const missingIds = productIds.filter(id => !existingOrderedIds.includes(id));
                    initialOrderPayload[category] = [...existingOrderedIds, ...missingIds];
                }
            }
        });
        
        return initialOrderPayload;
    });

    // Apply the current order to products for each category
    useEffect(() => {
        // This effect runs when orderPayload or categoriesKeys change
        logger.debug('productsSettings', 'applying product order to categories', { 
            categories: Object.keys(orderPayload) 
        });
    }, [orderPayload, categoriesKeys]);

    // Memoize the productsData for the selected tab based on our orderPayload
    const computedProductsData: ProductDataFull = useMemo(() => {
        if (!productsByCategories[selectedTab]) {
            return {};
        }
        
        // Sort the products based on our current orderPayload
        const sortedProducts = sortItems<ProductData>(
            productsByCategories[selectedTab],
            orderPayload[selectedTab] || [],
            (product) => product.id,
            (a, b) => a.name.localeCompare(b.name)
        );
        
        // Convert back to the ProductDataFull format
        return sortedProducts.reduce((acc, product) => {
            acc[product.id] = product;
            return acc;
        }, {} as ProductDataFull);
    }, [productsByCategories, selectedTab, orderPayload]);

    const updateOrder = (category: string, order: string[]) => {
        logger.debug('productsSettings', 'updating order for category', { 
            category, 
            orderLength: order.length 
        });
        
        // Mark as changed when order updates
        if (!orderChanged) {
            setOrderChanged(true);
            setSaveOpen(true);
        }
        
        // Update the order for this specific category
        setOrderPayload(prev => ({
            ...prev, 
            [category]: order
        }));
    };

    // Register save handler for product order
    useEffect(() => {
        // Function to save the current order
        const handleSaveOrder = async () => {
            logger.debug('productsSettings', 'save handler called', { orderChanged });
            
            if (!orderChanged) {
                logger.debug('productsSettings', 'no changes to save');
                return false;
            }
            
            logger.debug('productsSettings', 'saving product order', { 
                categories: Object.keys(orderPayload),
                tabCount: tabs.length
            });
            
            // Ensure all tabs are included in the final payload
            const finalOrderPayload = tabs.reduce((acc, tab) => {
                acc[tab] = orderPayload[tab] || [];
                return acc;
            }, {} as Record<string, string[]>);

            try {
                const res = await updateProductsOrder(store.id, finalOrderPayload);

                if (res.error) {
                    showErrorMessage({error: res.error});
                    logger.error('productsSettings', 'Failed to update order', { error: res.error });
                    return false;
                } else if (res.success) {
                    setOrderChanged(false);
                    logger.debug('productsSettings', 'Order updated successfully');
                    return true;
                }
            } catch (error) {
                logger.error('productsSettings', 'Failed to update order', { error });
                return false;
            }
            
            return false;
        };
        
        logger.debug('productsSettings', 'registering save handler');
        registerSaveHandler('product-order', handleSaveOrder);
        
        return () => {
            logger.debug('productsSettings', 'cleanup - component unmounting');
        };
    }, [registerSaveHandler, orderChanged, tabs, orderPayload, store.id]);

    return (
        <div>
            <div className={'flex justify-between'}>
                <div>
                    <p className="text-base font-medium text-default-700">{t("productManager")}</p>
                    <p className="mt-1 text-sm font-normal text-default-400">
                        {t("manageProductsDescription")}
                    </p>
                </div>
            </div>
            <Spacer y={4} />

            <Card shadow="none" className="w-full" >
                <CardHeader className={'pb-0'}>
                    <Reorder.Group
                        axis="x"
                        onReorder={(newOrder) => {
                            setTabs(newOrder);
                            if (!orderChanged) {
                                setOrderChanged(true);
                                setSaveOpen(true);
                            }
                        }}
                        className='flex-grow flex justify-start items-end space-x-2 w-full'
                        values={tabs}
                    >
                        {tabs.map((category) => (
                            <ItemCategory item={category} key={category}>
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
                            </ItemCategory>
                        ))}
                    </Reorder.Group>
                </CardHeader>
                <CardBody className={'flex'}>
                    <div className={'p-2 rounded-lg rounded-b-none bg-default-100 grid grid-cols-6 text-xs md:text-sm font-medium'}>
                        <div
                            className=" col-span-5  grid grid-cols-5 gap-x-4"
                        >
                            <span>{t("image")}</span>
                            <span className={'flex col-span-4'}>{t("nameAndPrice")}</span>
                        </div>
                        <span
                            className={'text-center'}
                        >{t("drag")}</span>
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
            
            </Card>
            <Spacer y={8} />
        </div>
    );
};

export default ProductManager;