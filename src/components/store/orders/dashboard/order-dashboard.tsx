"use client";
import type {RangeValue} from "@react-types/shared";

import React, {useEffect, useRef, useState, useTransition} from "react";
import {RangeCalendar, Button, ButtonGroup, cn, Spacer} from "@heroui/react";
import {useLocale} from "@react-aria/i18n";
import {useMediaQuery} from "usehooks-ts";
import {OrdersList} from "@/components/store/orders/dashboard/component/orders-list";
import {OrdersBarChart} from "@/components/store/orders/dashboard/component/orders-bar-chart";
import {motion} from "framer-motion";
import {useStore} from "@/components/providers/store-provider";
import {endOfMonth, endOfWeek, getLocalTimeZone, today, CalendarDate, startOfMonth} from "@internationalized/date";
import {getOrdersByDateRange, OrderData} from "@/lib/actions/order";
import {CalendarDashboard} from "@/components/ui/calendar-dashboard";
import { formatApiDate } from "@/lib/utils";

interface OrderDashboardProps {
    date?: string;
}

// Interface for storing order status information by date
interface OrderStatusByDate {
    [date: string]: {
        new: boolean;
        started: boolean;
        ready: boolean;
    };
}

export const OrderDashboard: React.FC<OrderDashboardProps> = ({date}) => {
    const { store } = useStore();
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const [orderDataList, setOrderDataList] = useState<OrderData[]>([]);


    let now = today(getLocalTimeZone());

    const [year, month, day] = date ? date.split("-").map(Number) : [undefined, undefined, undefined];

    let [dateRange, setDateRange] = React.useState<RangeValue<CalendarDate> | null>({
        start: year && month && day ? new CalendarDate(year, month, day) : now,
        end: year && month && day ? new CalendarDate(year, month, day) : now,
    });


    // For filtered data in the UI: use the selected date range
    const fromDate = dateRange?.start ? formatApiDate(dateRange.start.toDate(getLocalTimeZone())) : '';
    const toDate = dateRange?.end ? formatApiDate(dateRange.end.toDate(getLocalTimeZone())) : '';



    // Fetch orders for the selected date range
    useEffect(() => {
        if (!store?.id || !fromDate || !toDate) return;

        setIsLoading(true);

        startTransition(async () => {
            const data = await getOrdersByDateRange(store.id, fromDate, toDate);
            setOrderDataList(data);
            setIsLoading(false);
        });
    }, [store?.id, fromDate, toDate]);

    useEffect(() => {
        setIsLoading(isPending);
    }, [isPending]);

    return (
        <div ref={containerRef} className={'flex flex-col md:flex-row w-full max-w-[100vh] container gap-y-8 md:gap-x-8 lg:gap-x-8'}>
            <motion.div
                initial={{ opacity: 0, scale: 1.1, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                    duration: 0.5,
                    ease: "easeOut"
                }}
                className={'w-full md:w-1/2'}
            >
                <CalendarDashboard
                    selected={{
                        from: dateRange?.start?.toDate(getLocalTimeZone()) || new Date(),
                        to: dateRange?.end?.toDate(getLocalTimeZone()) || new Date()
                    }}
                    onDateRangeChange={(range) => {
                        if (range) {
                            startTransition(async () => {
                                const data = await getOrdersByDateRange(
                                    store.id,
                                    formatApiDate(range.from),
                                    formatApiDate(range.to)
                                );
                                setOrderDataList(data);
                            });
                            // Convert native Date to CalendarDate
                            setDateRange({
                                start: new CalendarDate(range.from.getFullYear(), range.from.getMonth() + 1, range.from.getDate()),
                                end: new CalendarDate(range.to.getFullYear(), range.to.getMonth() + 1, range.to.getDate())
                            });
                        }
                    }}
                    isLoading={isLoading}
                />
                <Spacer y={8} />
                <OrdersBarChart
                    isLoading={isLoading}
                    orderDataList={orderDataList || []}
                />
                <Spacer y={8} />
            </motion.div>
            <OrdersList
                setIsLoadingTime={setIsLoading}
                isLoadingTime={isLoading}
                fromDate={dateRange?.start?.toDate(getLocalTimeZone()) || new Date()}
                toDate={dateRange?.end?.toDate(getLocalTimeZone()) || new Date()}
                orderDataList={orderDataList || []}
            />
            <Spacer y={8} />
        </div>
    );
};