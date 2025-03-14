"use client";
import React from "react";
import {useRouter} from "next/navigation";
import {StoreData} from "@/lib/actions/store";
import {OrderData} from "@/lib/actions/order";
import GradientText from "@/components/ui/gradient-text";
import {Card, CardBody, CardFooter, CardHeader, Divider, Spacer} from "@heroui/react";
import {Icon} from "@iconify/react";
import {ProductTabs} from "@/components/store/product/components/product-tabs";
import {ProductSearch} from "@/components/store/product/components/product-search";
import {CategoryProducts} from "@/components/store/product/components/category-products";
import {AnimatePresence, motion} from "framer-motion";
import {ProductTable} from "@/components/settings/products/product-tab";
import {ItemList} from "@/components/store/orders/overview/components/item-list";
import {formatCurrency} from "@/lib/utils";


interface OrderItemsProps {
    storeData: StoreData;
    orderData: OrderData;
}

export const OrderItems: React.FC<OrderItemsProps> = ({storeData, orderData}) => {

    const router = useRouter();

    return (
        <div className={'flex flex-col w-full max-w-2xl'}>
            <Card>
                <CardHeader
                    className={'flex flex-col items-start'}
                >
                    <Spacer y={2}/>
                    <div className={'flex justify-center items-center'}>
                        <Icon icon={"solar:cart-broken"} width={24} height={24}/>
                        <Spacer x={2}/>
                        <p>Order Items</p>
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
                            <ItemList
                                orderId={orderData.id}
                                orderProducts={orderData.productsData}
                            />
                        </motion.div>
                    </AnimatePresence>
                </CardBody>
                <CardFooter
                    className={'grid grid-cols-5 col-span-5 cursor-pointer gap-x-4 '}
                >
                    <div className={'flex flex-col justify-between text-start col-span-4'}>
                        <div className="flex justify-between">
                            <span className="text-sm font-medium">Subtotal</span>
                            <span className="text-sm">{formatCurrency(orderData.amount)}</span>
                        </div>
                    </div>
                    <div className={'flex flex-col justify-between text-start col-span-4'}>
                        <div className="flex justify-between mt-2">
                            <span className="text-sm font-medium">VAT (21% inclusive)</span>
                            <span className="text-sm">{formatCurrency(orderData.amount_tax)}</span>
                        </div>
                    </div>
                    <div className={'flex flex-col justify-between text-start col-span-4'}>
                        <div className="flex justify-between mt-4">
                            <span className="text-base font-bold">Total</span>
                            <span className="text-base font-bold">{formatCurrency(orderData.amount)}</span>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};
