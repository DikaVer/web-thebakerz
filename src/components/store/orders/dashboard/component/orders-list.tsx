"use client";

import React, { useMemo, useEffect } from "react";
import {Button, Card, Chip, cn, ScrollShadow, Spacer, Select, SelectItem, Image} from "@heroui/react";
import {OrderData, OrderStatus} from "@/lib/actions/order";
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
import {OrderStatusChip, getStatusColor} from "@/components/ui/status-chip";
import { motion } from "framer-motion";
import {StatusSelect} from "@/components/store/orders/dashboard/component/status-select";
import {OrderStatusByDate} from "@/components/store/orders/dashboard/order-dashboard";

interface OrdersListProps {
    fromDate: Date;
    toDate: Date;
    orderDataList: OrderData[];
    setIsLoadingTime?: (isLoading: boolean) => void;
    isLoadingTime?: boolean;
    selectedStatuses: string[];
    setSelectedStatuses: (statuses: string[]) => void;
    orderStatusByDate: OrderStatusByDate;
    isStore?: boolean;
}

export const OrdersList: React.FC<OrdersListProps> = ({ setIsLoadingTime, orderDataList: initialOrderDataList, fromDate, toDate, isLoadingTime = false, selectedStatuses, setSelectedStatuses, orderStatusByDate, isStore = true}) => {
    const locale = useLocale();
    const c_T = useTranslations();
    const t = useTranslations("app/(store)/components/orders-list");
    const [isLoading, setIsLoading] = React.useState(false);
    const { store } = isStore ? useStore() : { store: null };
    const router = useRouter();
    
    // Track orders with status changes
    const [orderDataList, setOrderDataList] = React.useState<OrderData[]>(initialOrderDataList);
    
    // Update local orderDataList when props change
    React.useEffect(() => {
        setOrderDataList(initialOrderDataList);
    }, [initialOrderDataList]);

    // Define all possible statuses
    const allOrderStatuses: OrderStatus[] = ['new', 'started', 'ready', 'completed', 'cancelled', 'refunded'];

    // Compute status categories whenever orderDataList changes
    const statusCategories = useMemo(() => {
        if (!orderDataList || orderDataList.length === 0) return [];
        return [...new Set(orderDataList.map(order => order.order_status))];
    }, [orderDataList]);
    
    // Update an order's status in the local state
    const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
        setOrderDataList(prevOrders => 
            prevOrders.map(order => 
                order.id === orderId 
                    ? { ...order, order_status: newStatus } 
                    : order
            )
        );
    };

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

    const storeUrl = store?.storeName ? store?.storeName : store?.id;

    return (
        <div className="flex flex-col w-full md:w-1/2">
            <section id="Orders Top List" className="flex w-full items-center justify-between mb-4 px-1">
                <div className="flex flex-col">
                    <p className="text-xl">{t("orders")}</p>
                    <div className="flex items-center text-sm font-light text-default-600">
                        {formatDisplayDate(fromDate, locale)} - {formatDisplayDate(toDate, locale)}
                    </div>
                </div>
                <div className="flex justify-end items-end gap-2">
                    {store && (
                        <Button
                            isLoading={isLoading}
                            startContent={
                                <Icon icon="solar:document-add-linear" width={24} />
                            }
                            onPress={() => {
                                setIsLoading(true);
                                router.push("/" + storeUrl + "/orders/add");
                                router.refresh();
                            }}
                            variant="faded"
                            color="default"
                        >
                        {!isLoading && t("addOrder")}
                        </Button>
                    )}
                    {statusCategories.length > 0 && (
                        <Select
                            variant="faded"
                            color="default"
                            aria-label={t("orderStatusFilter")}
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
                            placeholder={t("no")}
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
                            {allOrderStatuses.map((status) => (
                                <SelectItem 
                                    key={status}
                                    textValue={c_T(`OrderStatus.${status.toLowerCase() || "unknown"}`)}
                                >
                                    <div className="flex items-center gap-2">
                                        {statusCategories.includes(status) && (
                                            <Chip size="sm" variant="flat" className={getStatusColor(status)}>
                                                {orderDataList.filter(order => order.order_status === status).length}
                                            </Chip>
                                        )}
                                         <span>{c_T(`OrderStatus.${status.toLowerCase() || "unknown"}`)}</span>
                                    </div>
                                </SelectItem>
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

                                            // Format dates as YYYY-MM-DD
                                            const formattedFromDate = new Date(fromDate.getTime() - (fromDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                                            const formattedToDate = new Date(toDate.getTime() - (toDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

                                            if (store) {
                                                router.push(
                                                    "/" + storeUrl +
                                                    "/orders/" + order.id +
                                                    "?email=" + order.customer.email_customer +
                                                    "&from=" + formattedFromDate +
                                                    "&to=" + formattedToDate
                                                );
                                            } else {
                                                router.push(
                                                    "/dashboard" +
                                                    "/orders/" + order.id +
                                                    "?email=" + order.customer.email_customer +
                                                    "&storeId=" + order.store_id +
                                                    "&from=" + formattedFromDate +
                                                    "&to=" + formattedToDate
                                                );
                                            }
                                            router.refresh();
                                        }}
                                    >
                                        <Card shadow="none"
                    
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
                                                                {t("order")} #{order.store_order_id}
                                                            </p>
                                                            <Chip
                                                                size="sm"
                                                                variant="flat"
                                                                className={'text-primary dark:text-white'}
                                                                color={order.status === 'paid' ? "primary" : "default"}
                                                            >
                                                                {order.status}
                                                            </Chip>
                                                        </div>
                                                        <div
                                                            className="text-sm text-default-600">{order.customer.name_customer}
                                                        </div>
                                                        <div
                                                            className="text-sm text-default-600">{order.customer.email_customer}
                                                        </div>
                                                        {order.isDelivery && (
                                                            <>
                                                                <Spacer y={2}/>
                                                                <div className={'flex gap-2'}>
                                                                    <Chip
                                                                        size="sm"
                                                                        variant="flat"
                                                                        className={`text-blue-700 bg-blue-200`}
                                                                        color={'default'}
                                                                    >
                                                                        <div className={'flex gap-2 items-center'}>
                                                                            {t("delivery")} • {order.deliveryAddress?.city ? order.deliveryAddress.city : "Unknown"}
                                                                            {!order.isStoreDelivery && (
                                                                                <Image
                                                                                    src="/images/TheBakerzLogo.svg"
                                                                                    width={24}
                                                                                    height={24}
                                                                                     alt={t("brandName") + " Logo"}
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    </Chip>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                    <StatusSelect
                                                        order={order}
                                                        currentStatus={order.order_status}
                                                        onStatusChange={(oldStatus: OrderStatus, newStatus: OrderStatus) => {
                                                            // Update the calendar dashboard counts
                                                            const statusCounts = orderStatusByDate[order.scheduled_time.date];

                                                            if (oldStatus === 'new') {
                                                                statusCounts.new_count--;
                                                                if (statusCounts.new_count <= 0) statusCounts.new = false;
                                                            }
                                                            if (oldStatus === 'started') {
                                                                statusCounts.started_count--;
                                                                if (statusCounts.started_count <= 0) statusCounts.started = false;
                                                            }
                                                            if (oldStatus === 'ready') {
                                                                statusCounts.ready_count--;
                                                                if (statusCounts.ready_count <= 0) statusCounts.ready = false;
                                                            }
                                                            
                                                            if (newStatus === 'new') {
                                                                statusCounts.new_count++;
                                                                statusCounts.new = true;
                                                            }
                                                            if (newStatus === 'started') {
                                                                statusCounts.started_count++;
                                                                statusCounts.started = true;
                                                            }
                                                            if (newStatus === 'ready') {
                                                                statusCounts.ready_count++;
                                                                statusCounts.ready = true;
                                                            }

                                                            // Update the order status in our local state
                                                            updateOrderStatus(order.id, newStatus);

                                                            // Handle the filter status updates with the updated orderDataList
                                                            let newSelectedStatuses = [...selectedStatuses];
                                                            
                                                            // 1. Add new status to filters if not already there
                                                            if (!newSelectedStatuses.includes(newStatus)) {
                                                                newSelectedStatuses.push(newStatus);
                                                            }
                                                            
                                                            // 2. Check if any other order still has the old status
                                                            // Use the updated orderDataList (with the current order already changed)
                                                            const anyOtherOrderHasOldStatus = orderDataList.some(o => 
                                                                o.id !== order.id && o.order_status === oldStatus
                                                            );
                                                            
                                                            // 3. Remove old status from filters if it was the last one
                                                            if (!anyOtherOrderHasOldStatus && newSelectedStatuses.includes(oldStatus)) {
                                                                newSelectedStatuses = newSelectedStatuses.filter(s => s !== oldStatus);
                                                            }
                                                            
                                                            // 4. Only update the state if there's a change
                                                            if (newSelectedStatuses.length !== selectedStatuses.length || 
                                                                !newSelectedStatuses.every(s => selectedStatuses.includes(s))) {
                                                                setSelectedStatuses(newSelectedStatuses);
                                                            }
                                                        }}
                                                    />
                                                </div>

                                                <Spacer y={2}/>

                                                <div className="flex justify-between items-center">
                                                    <div className="flex flex-col">
                                                        <div className="text-sm text-default-500">
                                                            {
                                                            order.isPostDelivery ? 
                                                                formatScheduledDate(order.scheduled_time, locale) 
                                                                : 
                                                                `${formatScheduledDate(order.scheduled_time, locale)} • ${formatScheduledTime(order.scheduled_time, locale)}`
                                                            }
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
                                                        {formatCurrency(order.priceData.itemInclVat)}
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
                            <p className="text-default-500">{t("noOrdersFound")}</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};