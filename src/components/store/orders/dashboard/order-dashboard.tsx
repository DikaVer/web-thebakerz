// src/components/store/orders/dashboard/order-dashboard.tsx
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
    const [calendarWidth, setCalendarWidth] = useState(768);
    const isSmall = useMediaQuery("(max-width: 768px)");
    const [orderStatusByDate, setOrderStatusByDate] = useState<OrderStatusByDate>({});

    // State for storing fetched data
    const [monthOrderData, setMonthOrderData] = useState<OrderData[]>([]);
    const [orderDataList, setOrderDataList] = useState<OrderData[]>([]);

    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const subtractPadding = 0
                const divider = isSmall ? 1 : 2;
                const containerWidth = entry.contentRect.width/divider - subtractPadding;
                setCalendarWidth(Math.min(containerWidth, 768));
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, [isSmall]);

    let now = today(getLocalTimeZone());
    let [focusedValue, setFocusedValue] = React.useState<CalendarDate | null>(now);

    const [year, month, day] = date ? date.split("-").map(Number) : [undefined, undefined, undefined];

    let [dateRange, setDateRange] = React.useState<RangeValue<CalendarDate> | null>({
        start: year && month && day ? new CalendarDate(year, month, day) : now,
        end: year && month && day ? new CalendarDate(year, month, day) : now,
    });

    // Get current month range for fetching all month data
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    // Format date for API call
    const formatApiDate = (date: CalendarDate) => {
        return date.toString();
    };

    // For displaying dots: fetch data for the whole month regardless of selected range
    const monthFromDate = formatApiDate(currentMonthStart);
    const monthToDate = formatApiDate(currentMonthEnd);

    // For filtered data in the UI: use the selected date range
    const fromDate = dateRange?.start ? formatApiDate(dateRange.start) : '';
    const toDate = dateRange?.end ? formatApiDate(dateRange.end) : '';

    // Fetch month data for calendar indicators
    useEffect(() => {
        if (!store?.id) return;

        startTransition(async () => {
            const data = await getOrdersByDateRange(store.id, monthFromDate, monthToDate);
            setMonthOrderData(data);
        });
    }, [store?.id, monthFromDate, monthToDate]);

    // Process month data to create status indicators for calendar
    useEffect(() => {
        if (!monthOrderData) return;

        const statusByDate: OrderStatusByDate = {};

        monthOrderData.forEach(order => {
            const date = order.scheduled_time.date;

            if (!statusByDate[date]) {
                statusByDate[date] = {
                    new: false,
                    started: false,
                    ready: false
                };
            }

            if (order.order_status === 'new') {
                statusByDate[date].new = true;
            } else if (order.order_status === 'started') {
                statusByDate[date].started = true;
            } else if (order.order_status === 'ready') {
                statusByDate[date].ready = true;
            }
        });

        setOrderStatusByDate(statusByDate);
    }, [monthOrderData]);

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

    let {locale} = useLocale();

    let thisMonth = {start: now, end: endOfMonth(now)};
    let thisWeek = {
        start: now,
        end: endOfWeek(now.add({weeks: 1}), locale),
    };

    const handleRangeChange = (value: RangeValue<CalendarDate>) => {
        setDateRange(value);
    };

    // Add CSS for status dots
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
        .calendar-cell [role="button"][aria-label*=","]:after {
            content: '';
            position: absolute;
            bottom: 4px;
            left: 0;
            right: 0;
            height: 8px;
            display: flex;
            justify-content: center;
            gap: 4px;
        }

        ${Object.entries(orderStatusByDate).map(([date, statuses]) => {
            const dateObj = new Date(date);
            const month = dateObj.toLocaleString('en-US', { month: 'long' });
            const day = dateObj.getDate();
            const year = dateObj.getFullYear();
            const formattedDate = `${month} ${day}, ${year}`;

            const dots = [];
            if (statuses.new) dots.push('new');
            if (statuses.started) dots.push('started');
            if (statuses.ready) dots.push('ready');

            if (dots.length === 0) return '';

            let dotCSS = '';
            if (dots.length === 1) {
                const color = dots[0] === 'new' ? '#F31260' : dots[0] === 'started' ? '#F9C97C' : '#3B82F6';
                dotCSS = `background: radial-gradient(circle at 50% 50%, ${color} 4px, transparent 0);`;
            } else if (dots.length === 2) {
                const color1 = dots[0] === 'new' ? '#F31260' : dots[0] === 'started' ? '#F9C97C' : '#3B82F6';
                const color2 = dots[1] === 'new' ? '#F31260' : dots[1] === 'started' ? '#F9C97C' : '#3B82F6';
                dotCSS = `
                    background-image:
                        radial-gradient(circle at calc(50% - 6px) 50%, ${color1} 4px, transparent 0),
                        radial-gradient(circle at calc(50% + 6px) 50%, ${color2} 4px, transparent 0);
                    background-repeat: no-repeat;
                `;
            } else if (dots.length === 3) {
                dotCSS = `
                    background-image:
                        radial-gradient(circle at calc(50% - 10px) 50%, #F31260 4px, transparent 0),
                        radial-gradient(circle at 50% 50%, #F9C97C 4px, transparent 0),
                        radial-gradient(circle at calc(50% + 10px) 50%, #3B82F6 4px, transparent 0);
                    background-repeat: no-repeat;
                `;
            }

            return `.calendar-cell [role="button"][aria-label*="${formattedDate}"]:after {
                content: '';
                position: absolute;
                bottom: 4px;
                left: 0;
                right: 0;
                height: 8px;
                display: flex;
                justify-content: center;
                gap: 4px;
                ${dotCSS}
            }`;
        }).join('\n')}
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, [orderStatusByDate])

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
                <RangeCalendar
                    // @ts-ignore
                    focusedValue={focusedValue}
                    weekdayStyle={'short'}
                    color={'foreground'}
                    classNames={{
                        base: "w-full",
                        gridHeaderCell: "w-full",
                        cell: cn(
                            "flex w-full items-center justify-center aspect-square relative calendar-cell"
                        ),
                        cellButton: cn(
                            "w-full h-full rounded-full",
                            "data-[selected=true]:data-[selection-start=true]:data-[range-selection=true]:bg-primary-500 data-[selected=true]:data-[selection-start=true]:data-[range-selection=true]:text-black",
                            "data-[selected=true]:data-[selection-end=true]:data-[range-selection=true]:bg-primary-500 data-[selected=true]:data-[selection-end=true]:data-[range-selection=true]:text-black",
                            "data-[selected=true]:data-[range-selection=true]:bg-transparent",
                            "data-[selected=true]:data-[range-selection=true]:before:bg-primary-100",
                        ),
                        gridBodyRow: "px-4",
                    }}
                    calendarWidth={calendarWidth}
                    nextButtonProps={{
                        variant: "bordered",
                    }}
                    prevButtonProps={{
                        variant: "bordered",
                    }}
                    topContent={
                        <ButtonGroup
                            fullWidth
                            className="px-3 max-w-full pb-2 pt-3 bg-content1 [&>button]:text-default-500 [&>button]:border-default-200/60"
                            radius="full"
                            size="sm"
                            variant="bordered"
                        >
                            <Button
                                onPress={() => {
                                    const todayValue = {start: now, end: now};
                                    setDateRange(todayValue);
                                    setFocusedValue(now);
                                }}
                            >
                                Today
                            </Button>
                            <Button
                                onPress={() => {
                                    setDateRange(thisWeek);
                                    setFocusedValue(thisWeek.end);
                                }}
                            >
                                This Week
                            </Button>
                            <Button
                                onPress={() => {
                                    setDateRange(thisMonth);
                                    setFocusedValue(thisMonth.start);
                                }}
                            >
                                This month
                            </Button>
                        </ButtonGroup>
                    }
                    // @ts-ignore
                    value={dateRange}
                    // @ts-ignore
                    onChange={handleRangeChange}
                    // @ts-ignore
                    onFocusChange={setFocusedValue}
                />
                <Spacer y={8} />
                <OrdersBarChart
                    isLoading={isLoading}
                    orderDataList={orderDataList || []}
                />
                <Spacer y={8} />
            </motion.div>
            <OrdersList
                isLoadingTime={isLoading}
                fromDate={dateRange?.start?.toDate(getLocalTimeZone()) || new Date()}
                toDate={dateRange?.end?.toDate(getLocalTimeZone()) || new Date()}
                orderDataList={orderDataList || []}
            />
            <Spacer y={8} />
        </div>
    );
};