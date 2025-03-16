"use client";

import React, { useMemo, useEffect } from "react";
import {Button, Card, Chip, cn, ScrollShadow, Spacer, Select, SelectItem} from "@heroui/react";
import { OrderData} from "@/lib/actions/order";
import { Icon } from "@iconify/react";
import { useLocale, useTranslations } from "next-intl";
import {
    formatCurrency,
    formatDisplayDate,
    formatDisplayTime, formatScheduledDate,
    formatScheduledDateTime,
    formatScheduledTime
} from "@/lib/utils";
import { useStore } from "@/components/providers/store-provider";
import { useRouter } from "next/navigation";
import {OrderStatusChip} from "@/components/ui/status-chip";
import { motion } from "framer-motion";

interface OrdersListProps {
    fromDate: Date;
    toDate: Date;
    orderDataList: OrderData[];
    setIsLoadingTime?: (isLoading: boolean) => void;
    isLoadingTime?: boolean;
}

export const OrdersList: React.FC<OrdersListProps> = ({ setIsLoadingTime, orderDataList, fromDate, toDate, isLoadingTime = false }) => {
    const locale = useLocale();
    const t = useTranslations("TheBakerz");
    const statusT = useTranslations("OrderStatus");
    const [isLoading, setIsLoading] = React.useState(false);
    const { store } = useStore();
    const router = useRouter();

    // Add state for status filtering
    const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);

    // Compute status categories whenever orderDataList changes
    const statusCategories = useMemo(() => {
        if (!orderDataList || orderDataList.length === 0) return [];
        return [...new Set(orderDataList.map(order => order.order_status))];
    }, [orderDataList]);

    // Update selected statuses when status categories change
    useEffect(() => {
        if (statusCategories.length > 0) {
            setSelectedStatuses(statusCategories);
        }
    }, [statusCategories]);

    // Handle status selection change
    const handleStatusChange = (keys: any) => {
        // HeroUI's Select component returns a Set for multiple selection mode
        if (keys instanceof Set) {
            setSelectedStatuses(Array.from(keys) as string[]);
        } else {
            setSelectedStatuses(Array.isArray(keys) ? keys : [keys]);
        }
    };

    // Filter orders based on date range and selected statuses
    const filteredOrders = useMemo(() => {
        if (!orderDataList || orderDataList.length === 0) return [];

        return orderDataList
            .filter(order => {
                // Filter by status (only if we have selected statuses)
                return selectedStatuses.length === 0 || selectedStatuses.includes(order.order_status);
            })
            .sort((a, b) => {
                // Convert date and time strings to Date objects for proper comparison
                // Handle potentially malformed date formats
                try {
                    const dateTimeA = `${a.scheduled_time.date}T${a.scheduled_time.time}`;
                    const dateTimeB = `${b.scheduled_time.date}T${b.scheduled_time.time}`;
                    const dateA = new Date(dateTimeA);
                    const dateB = new Date(dateTimeB);

                    // Verify if dates are valid before comparing
                    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
                        return 0;
                    }

                    return dateA.getTime() - dateB.getTime();
                } catch (error) {
                    console.error("Error sorting orders by date:", error);
                    return 0;
                }
            });
    }, [orderDataList, selectedStatuses]);

    // Container and item variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <div className="flex flex-col w-full md:w-1/2">
            <section id="Orders Top List" className="flex w-full items-center justify-between mb-4 px-1">
                <div className="flex flex-col">
                    <p className="text-xl">{t("Orders")}</p>
                    <div className="flex items-center text-sm font-light text-default-600">
                        {formatDisplayDate(fromDate, locale)} - {formatDisplayDate(toDate, locale)}
                    </div>
                </div>
                <div className="flex justify-end items-end gap-2">
                    <Button
                        isLoading={isLoading}
                        startContent={
                            <Icon icon="solar:document-add-linear" width={24} />
                        }
                        onPress={() => {
                            setIsLoading(true);
                            router.push("/" + store?.storeName + "/orders/add");
                            router.refresh();
                        }}
                        variant="faded"
                        color="default"
                    >
                        {!isLoading && t("Add Order")}
                    </Button>
                    {statusCategories.length > 0 && (
                        <Select
                            variant="faded"
                            color="default"
                            aria-label={t("Order Status Filter")}
                            disableSelectorIconRotation
                            classNames={{
                                base: "w-fit",
                                trigger: "flex w-fit h-10 aspect-square",
                                innerWrapper: "hidden",
                                popoverContent: "min-w-[150px] transform -translate-x-28",
                                selectorIcon: "text-text",
                                mainWrapper: "pl-1 max-w-full justify-between items-center",
                            }}
                            popoverProps={{
                                placement: "bottom",
                            }}
                            listboxProps={{
                                itemClasses: {
                                    title: "text-tiny",
                                },
                            }}
                            placeholder={t("No")}
                            selectionMode="multiple"
                            size="sm"
                            selectorIcon={
                                <div className={'mb-2 w-6'}>
                                    <Icon icon="mage:filter" className={'-translate-y-1 -translate-x-0.5'} width={24}/>
                                </div>
                            }
                            selectedKeys={selectedStatuses}
                            onSelectionChange={handleStatusChange}
                            defaultSelectedKeys={statusCategories}
                        >
                            {statusCategories.map((cat) => (
                                <SelectItem key={cat}>{statusT(cat.toLowerCase() || "unknown")}</SelectItem>
                            ))}
                        </Select>
                    )}
                </div>
            </section>

            <div className="flex flex-col gap-4 max-h-[calc(100vh-180px)]">
                {isLoadingTime ? (
                    <div className={'flex flex-col items-center justify-center min-h-[280px]'}>
                        <div className="animate-spin mb-4">
                            <Icon icon="eos-icons:loading" width={48} />
                        </div>
                    </div>
                ) : (
                    filteredOrders.length > 0 ? (
                        <ScrollShadow
                            hideScrollBar
                            className="p-1"
                        >
                            <motion.div
                                className="flex flex-col gap-4"
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                            >
                                {filteredOrders.map((order, index) => (
                                    <motion.div
                                        key={order.id}
                                        variants={itemVariants}
                                        onClick={() => {
                                            setIsLoadingTime && setIsLoadingTime(true);
                                            router.push("/" + store?.storeName + "/orders/" + order.id + "?email=" + order.customer.email_customer);
                                            router.refresh()
                                        }}
                                    >
                                        <Card
                                            shadow={'sm'}
                                            className={cn("p-4 hover:bg-default-100 cursor-pointer",
                                                order.order_status === 'cancelled' && 'shadow-none border-1 opacity-50',
                                                order.order_status === 'completed' && 'shadow-none border-1 opacity-50',
                                                order.order_status === 'refunded' && 'shadow-none border-1 opacity-50'
                                            )}
                                        >
                                            <>
                                                <div className="flex justify-between items-start">
                                                    <div className="flex flex-col items-start">
                                                        <div className="flex font-medium justify-center gap-x-4">
                                                            <p>
                                                                {t("Order")} #{order.store_order_id}
                                                            </p>
                                                            <Chip
                                                                size="sm"
                                                                variant="flat"
                                                                className={'dark:text-white'}
                                                                color={order.status === 'paid' ? "primary" : "default"}
                                                            >
                                                                {order.status}
                                                            </Chip>
                                                        </div>
                                                        <div
                                                            className="text-sm text-default-600">{order.customer.name_customer}</div>
                                                        <div
                                                            className="text-sm text-default-600">{order.customer.email_customer}</div>
                                                    </div>
                                                    <OrderStatusChip
                                                        status={order.order_status}
                                                    />
                                                </div>

                                                <Spacer y={2}/>

                                                <div className="flex justify-between items-center">
                                                    <div className="flex flex-col">
                                                        <div className="text-sm text-default-500">
                                                            {formatScheduledDate(order.scheduled_time, locale)} • {formatScheduledTime(order.scheduled_time, locale)}
                                                        </div>

                                                    </div>
                                                </div>

                                                <div className={'flex justify-between items-end'}>
                                                    {order.productsData && order.productsData.length > 0 && (
                                                        <>
                                                            <div className="flex flex-col text-xs text-default-700">
                                                                <Spacer y={2}/>
                                                                {order.productsData.map((product) => (
                                                                    <span
                                                                        key={`${order.id}-${product.id}-${Math.random()}`}>
                                                                {product.qty} × {product.name}
                                                            </span>
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className="font-medium">
                                                        {formatCurrency(order.amount)}
                                                    </div>
                                                </div>
                                            </>
                                        </Card>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </ScrollShadow>
                    ) : (
                        <div className="p-8 flex flex-col items-center justify-center">
                            <Icon icon="solar:clipboard-list-broken" width={48} className="text-default-500" />
                            <Spacer y={2} />
                            <p className="text-default-500">{t("No Orders Found")}</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};