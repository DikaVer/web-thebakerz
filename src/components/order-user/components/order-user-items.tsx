/**
 * @fileoverview Order items card with a price breakdown for a customer's order.
 *
 * Exports the OrderUserItems component, which wraps ItemUserList in a card
 * and renders a footer summarizing subtotal, VAT, delivery fee, service fee,
 * and total amounts from the order's price data.
 */
"use client";
import React from "react";

import {OrderData} from "@/lib/actions/order";
import {Card, CardBody, CardFooter, CardHeader, Divider, Spacer} from "@heroui/react";
import {Icon} from "@iconify/react";
import {AnimatePresence, motion} from "framer-motion";
import {formatCurrency} from "@/lib/utils";
import {useTranslations} from "next-intl";
import { ItemUserList } from "./item-user-list";

interface OrderUserItemsProps {
    orderData: OrderData;
}

export const OrderUserItems: React.FC<OrderUserItemsProps> = ({orderData}) => {

    const t = useTranslations("app/(store)/components/orders/overview");


    // Filter products based on search term
    return (
        <div className={'flex flex-col w-full max-w-2xl'}>
            <Card shadow="none">
                <CardHeader
                    className={'flex flex-col items-start'}
                >
                    <Spacer y={2}/>
                    <div className={'flex justify-between items-center w-full'}>
                        <div className={'flex justify-center items-center'}>
                            <Icon icon={"solar:cart-broken"} width={24} height={24}/>
                            <Spacer x={2}/>
                            <p>{t("Order Items")}</p>
                        </div>
                    </div>
                    <Spacer y={4}/>
                    <Divider />
                </CardHeader>
                <CardBody>
                    <AnimatePresence mode="wait">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            style={{ width: "100%" }}
                        >
                            <ItemUserList
                                orderId={orderData.id}
                                orderProducts={orderData.productsData}
                                storeId={orderData.store_id}
                            />
                        </motion.div>
                    </AnimatePresence>
                </CardBody>
                <CardFooter
                    className={'grid grid-cols-4 col-span-4 gap-x-4 '}
                >
                    <div className={'flex flex-col justify-between text-start col-span-4'}>
                        <div className="flex justify-between">
                            <span className="text-sm font-medium">{t("Subtotal")}</span>
                            <span className="text-sm">{formatCurrency(orderData.priceData.itemExclVat)}</span>
                        </div>
                    </div>
                    {orderData.priceData.itemVat > 0 &&
                        <div className={'flex flex-col justify-between text-start col-span-4'}>
                            <div className="flex justify-between mt-2">
                                <span className="text-sm font-medium">{t("VAT Exclusive")}</span>
                                <span className="text-sm">{formatCurrency(orderData.priceData.itemVat)}</span>
                            </div>
                        </div>
                    }
                    {orderData.priceData.deliveryFeeExclVat > 0 &&
                        <>    
                            <div className={'flex flex-col justify-between text-start col-span-4'}>
                                <div className="flex justify-between mt-2">
                                    <span className="text-sm font-medium">{t("Delivery Fee")}</span>
                                    <span className="text-sm">{formatCurrency(orderData.priceData.deliveryFeeExclVat)}</span>
                                </div>
                            </div>
                            {orderData.priceData.deliveryVat > 0 &&
                                <div className={'flex flex-col justify-between text-start col-span-4'}>
                                    <div className="flex justify-between mt-2">
                                        <span className="text-sm font-medium">{t("Delivery VAT")}</span>
                                        <span className="text-sm">{formatCurrency(orderData.priceData.deliveryVat)}</span>
                                    </div>
                                </div>
                            }
                        </>
                    }
                    {orderData.priceData.serviceFeeInclVat > 0 &&
                        <>
                            <div className={'flex flex-col justify-between text-start col-span-4'}>
                                <div className="flex justify-between mt-2">
                                    <span className="text-sm font-medium">{t("Service Fee")}</span>
                                    <span className="text-sm">{formatCurrency(orderData.priceData.serviceFeeInclVat)}</span>
                                </div>
                            </div>
                            {/* {orderData.priceData.serviceVat > 0 &&
                                <div className={'flex flex-col justify-between text-start col-span-4'}>
                                    <div className="flex justify-between mt-2">
                                        <span className="text-sm font-medium">{t("Service VAT")}</span>
                                        <span className="text-sm">{formatCurrency(orderData.priceData.serviceVat)}</span>
                                    </div>
                                </div>
                            } */}
                        </>
                    }
                    <div className={'flex flex-col justify-between text-start col-span-4'}>
                        <Spacer y={2} />
                        <Divider className="my-2" />
                        <Spacer y={4} />
                        <div className="flex justify-between">
                            <span className="text-base font-bold">{t("Total")}</span>
                            <span className="text-base font-bold">{formatCurrency(orderData.priceData.totalInclVat)}</span>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};