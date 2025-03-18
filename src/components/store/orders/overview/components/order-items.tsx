"use client";
import React, { useState, ChangeEvent } from "react";
import {useRouter} from "next/navigation";
import {StoreData} from "@/lib/actions/store";
import {OrderData} from "@/lib/actions/order";
import {Card, CardBody, CardFooter, CardHeader, Divider, Input, Spacer} from "@heroui/react";
import {Icon} from "@iconify/react";
import {AnimatePresence, motion} from "framer-motion";
import {ItemList} from "@/components/store/orders/overview/components/item-list";
import {formatCurrency} from "@/lib/utils";
import {useTranslations} from "next-intl";

interface OrderItemsProps {
    storeData: StoreData;
    orderData: OrderData;
}

export const OrderItems: React.FC<OrderItemsProps> = ({storeData, orderData}) => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const t = useTranslations("TheBakerz");

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Filter products based on search term
    const filteredProducts = searchTerm.trim() !== ""
        ? orderData.productsData.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : orderData.productsData;

    return (
        <div className={'flex flex-col w-full max-w-2xl'}>
            <Card>
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
                        <Input
                            className="w-1/3"
                            classNames={{
                                mainWrapper: "rounded-xl border-1",
                                inputWrapper: "bg-content1",
                            }}
                            placeholder={t("Search Items")}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            type="text"
                            startContent={
                                <Icon icon="solar:magnifer-broken" width={24} className="text-default-400"/>
                            }
                        />
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
                                searchTerm={searchTerm}
                                orderId={orderData.id}
                                orderProducts={filteredProducts}
                            />
                        </motion.div>
                    </AnimatePresence>
                </CardBody>
                <CardFooter
                    className={'grid grid-cols-5 col-span-5 gap-x-4 '}
                >
                    <div className={'flex flex-col justify-between text-start col-span-4'}>
                        <div className="flex justify-between">
                            <span className="text-sm font-medium">{t("Subtotal")}</span>
                            <span className="text-sm">{formatCurrency(orderData.sub_amount)}</span>
                        </div>
                    </div>
                    {orderData.tax_amount > 0 &&
                        <div className={'flex flex-col justify-between text-start col-span-4'}>
                            <div className="flex justify-between mt-2">
                                <span className="text-sm font-medium">{t("VAT Exclusive")}</span>
                                <span className="text-sm">{formatCurrency(orderData.tax_amount)}</span>
                            </div>
                        </div>
                    }
                    <div className={'flex flex-col justify-between text-start col-span-4'}>
                        <div className="flex justify-between mt-4">
                            <span className="text-base font-bold">{t("Total")}</span>
                            <span className="text-base font-bold">{formatCurrency(orderData.amount)}</span>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};