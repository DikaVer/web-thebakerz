"use client";
import React, {useMemo, useState} from "react";
import {OrderProduct, OrderProducts} from "@/lib/actions/order";
import {ItemProduct} from "@/components/ui/drag-item";
import {formatCurrency} from "@/lib/utils";
import {Reorder} from "framer-motion";
import CustomAlert from "@/components/ui/custom-alerts";
import {useMediaQuery} from "usehooks-ts";
import {useTheme} from "next-themes";
import {useTranslations} from "next-intl";
import {formatVariants} from "@/components/cart/cart-item";
import Image from "next/image";
import {Button} from "@heroui/react";
import {useRouter} from "next/navigation";
import {Icon} from "@iconify/react";


interface ItemUserListProps {
    orderId: string;
    orderProducts: OrderProducts;
    storeId: string;
}   

export const ItemUserList: React.FC<ItemUserListProps> = ({orderId, orderProducts, storeId}) => {
    const t = useTranslations("app/(store)/components/orders/overview");
    const router = useRouter();

    if (!orderProducts) {
        return <p>{t("Something Went Wrong")}</p>
    }

    const { theme } = useTheme();

    // Create a dictionary (object) with uniqueId as the key and order data as the value
    const orderDictionary = useMemo<{ [key: string]: OrderProduct }>(() => {
        return orderProducts.reduce((dict, item, index) => {
            // Use product ID or create a stable compound key
            dict[index] = item;
            return dict;
        }, {} as { [key: string]: OrderProduct });
    }, [orderProducts]);


    const [products, setProducts] = useState<string[]>(() => {
        // Get orderId (assuming it's available in orderProducts[0])

        if (!orderId) return Object.keys(orderDictionary);

        // Try to get saved order from localStorage
        const savedOrder = localStorage.getItem(`order_products_${orderId}`);
        if (savedOrder) {
            try {
                const parsedOrder = JSON.parse(savedOrder);
                // Verify all keys still exist in the current dictionary
                const validKeys = parsedOrder.filter((key: string) => orderDictionary[key]);
                if (validKeys.length === Object.keys(orderDictionary).length) {
                    return validKeys;
                }
            } catch (e) {
                console.error("Error parsing saved order:", e);
            }
        }

        // Fallback to default order
        return Object.keys(orderDictionary);
    });

    const navigateToProduct = (productId: string) => {
        router.push(`/${storeId}/item/${productId}`);
    };

    const orderAgain = (item: OrderProduct) => {
        // You would implement the add to cart functionality here
        // For now, we'll just navigate to the product page
        navigateToProduct(item.id);
    };

    const isSmall = useMediaQuery("(max-width: 640px)");

    return (
        <div
            className='w-full'
        >
            {products.map((uniqueId) => {
                const item = orderDictionary[uniqueId];
                if (!item) {
                    return null;
                }
                return (
                    <div
                        key={uniqueId}
                        className='border-b border-default-200 py-4'
                    >
                        <div className="flex items-start gap-3">
                            {item.image && (
                                <div 
                                    className="flex-shrink-0 cursor-pointer" 
                                    onClick={() => navigateToProduct(item.id)}
                                >
                                    <div className="relative w-16 h-16 rounded-md overflow-hidden">
                                        <Image 
                                            src={item.image} 
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                        />
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex flex-col flex-grow gap-1">
                                <div className="flex justify-between items-start">
                                    <div className="cursor-pointer" onClick={() => navigateToProduct(item.id)}>
                                        <CustomAlert
                                            color={theme === 'dark' ? 'secondary' : 'primary'}
                                            hideIcon={true}
                                            classNames={{
                                                base: 'p-0 px-2 bg-primary-100 dark:bg-primary-100 rounded-r-full w-fit',
                                                mainWrapper: 'p-0 py-1 min-h-0',
                                            }}
                                        >
                                            <p className="text-primary-800 dark:text-secondary font-medium ">{item.name}</p>
                                        </CustomAlert>
                                    </div>
                                    
                                    <span className="text-small text-default-500 font-medium ml-2">
                                        {formatCurrency(item.unitAmount)} X {item.qty}
                                    </span>
                                </div>
                                
                                <div className="flex flex-col text-default-400 gap-2 mt-1">
                                    {item.note && (
                                        <CustomAlert
                                            color="blue"
                                            hideIcon={true}
                                            classNames={{
                                                base: 'p-0 pl-2 bg-blue-100 rounded-r-full w-fit',
                                                mainWrapper: 'p-0 py-1 min-h-0',
                                            }}
                                        >
                                            <p className="text-small text-blue-600">{item.note}</p>
                                        </CustomAlert>
                                    )}
                                    {item.variants && item.variants.length > 0 && (
                                        <div className="mt-1">
                                            {formatVariants(
                                                item.variants,
                                                'warning',
                                                {
                                                text: 'text-small',
                                                }
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex justify-end mt-2">
                                    <Button
                                        aria-label="Order again"
                                        size="sm"
                                        color="primary"
                                        variant="flat"
                                        className="px-3 py-1"
                                        onPress={() => orderAgain(item)}
                                    >
                                        <Icon icon="solar:cart-plus-linear" className="mr-1" width={16} height={16} />
                                        {t("Order Again")}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};