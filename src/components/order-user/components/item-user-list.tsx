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


interface ItemUserListProps {
    orderId: string;
    orderProducts: OrderProducts;
}   

export const ItemUserList: React.FC<ItemUserListProps> = ({orderId, orderProducts}) => {
    const t = useTranslations("app/(store)/components/orders/overview");

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
                        className='border-b border-default-200  grid grid-cols-5 py-8 gap-x-4"'
                    >
                        <div
                            className="grid grid-cols-5 col-span-5 gap-x-4 items-center"
                        >
                            <div className={'flex flex-col justify-between text-start col-span-4 gap-y-2'}>
                                <CustomAlert
                                    color={theme === 'dark' ? 'secondary' : 'primary'}
                                    hideIcon={true}
                                    classNames={{
                                        base: 'p-0 pl-2 bg-primary-100 dark:bg-primary-100 rounded-r-full',
                                        mainWrapper: 'p-0 py-1 min-h-0',
                                    }}
                                >
                                    <p className="text-primary-800 dark:text-secondary font-medium">{item.name}</p>
                                </CustomAlert>

                                {isSmall &&
                                    <span className={'text-small text-default-500 font-medium '}>
                                    {formatCurrency(item.price)} X {item.qty}
                                </span>
                                }
                                <div className={"flex flex-col text-default-400 gap-2"}>
                                    {item.note && (
                                        <>
                                            <CustomAlert
                                                color="blue"
                                                hideIcon={true}
                                                classNames={{
                                                    base: 'p-0 pl-2 bg-blue-100 rounded-r-full',
                                                    mainWrapper: 'p-0 py-1 min-h-0',
                                                }}
                                            >
                                                <p className="text-small text-blue-600">{item.note}</p>
                                            </CustomAlert>
                                        </>
                                    )}
                                    {item.variants && item.variants.length > 0 && (
                                        <div className="mt-1 mb-1">
                                            {formatVariants(
                                                item.variants,
                                                'warning',
                                                {
                                                text: 'text-small',
                                                }
                                            )}
                                        </div>
                                    )}
                                    {/* Ingredients Alert: Default variant */}
                                    {/*{item.ingredients && item.ingredients.length > 0 && (*/}
                                    {/*    <CustomAlert*/}
                                    {/*        color="default"*/}
                                    {/*        title={t("Ingredients")}*/}
                                    {/*        hideIcon*/}
                                    {/*        classNames={{*/}
                                    {/*            title: "text-text font-medium",*/}
                                    {/*            base: 'p-0 pl-2'*/}
                                    {/*        }}*/}
                                    {/*    >*/}
                                    {/*        <div className="flex flex-wrap gap-2 mt-1">*/}
                                    {/*            {item.ingredients.map((ingredient, index) => {*/}
                                    {/*                return (*/}
                                    {/*                    <div*/}
                                    {/*                        key={ingredient}*/}
                                    {/*                        className={`flex items-center gap-2 px-2 py-1 text-sm rounded-full text-text bg-default-200`}*/}
                                    {/*                    >*/}
                                    {/*                        <AllergenIcon allergen={ingredient} size={18}/>*/}
                                    {/*                        <span className={'font-medium text-small'}>*/}
                                    {/*                            {ingredient}*/}
                                    {/*                        </span>*/}
                                    {/*                    </div>*/}
                                    {/*                );*/}
                                    {/*            })}*/}
                                    {/*        </div>*/}
                                    {/*    </CustomAlert>*/}
                                    {/*)}*/}
                                    {/* Allergies Alert: Warning variant */}
                                    {/*{item.allergies && item.allergies.length > 0 && (*/}
                                    {/*    <CustomAlert*/}
                                    {/*        color="warning"*/}
                                    {/*        title={t("Allergies")}*/}
                                    {/*        hideIcon*/}
                                    {/*        classNames={{*/}
                                    {/*            title: "text-text font-medium",*/}
                                    {/*            base: 'p-0 pl-2 '*/}
                                    {/*        }}*/}
                                    {/*    >*/}
                                    {/*        <div className="flex flex-wrap gap-2 mt-1">*/}

                                    {/*            {item.allergies.map((allergies, index) => {*/}
                                    {/*                return (*/}
                                    {/*                    <div*/}
                                    {/*                        key={allergies}*/}
                                    {/*                        className={`flex items-center gap-1 px-2 py-1 text-sm rounded-full text-warning-800 bg-warning-200`}*/}
                                    {/*                    >*/}
                                    {/*                        <AllergenIcon allergen={allergies} size={18}/>*/}
                                    {/*                        <span className={'font-medium text-small'}>*/}
                                    {/*                            {allergy(allergies)}*/}
                                    {/*                        </span>*/}

                                    {/*                    </div>*/}
                                    {/*                );*/}
                                    {/*            })}*/}
                                    {/*        </div>*/}
                                    {/*    </CustomAlert>*/}
                                    {/*)}*/}
                                </div>
                            </div>
                            {!isSmall &&
                                <span className={'flex text-small text-default-500 font-medium justify-end'}>
                                    {formatCurrency(item.unitAmount)} X {item.qty}
                                </span>
                            }
                        </div>
                    </div>
                );

            })}
        </div>
    );
};