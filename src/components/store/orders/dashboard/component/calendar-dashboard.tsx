"use client"

import * as React from "react"
import {DayPicker, DayModifiers, useActiveModifiers, DayProps, useDayRender} from "react-day-picker"
import { addDays, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, isBefore, isAfter, isSameDay } from "date-fns"

import { cn, formatApiDate } from "@/lib/utils"
import { getOrdersByDateRange, OrderData } from "@/lib/actions/order"
import { useStore } from "@/components/providers/store-provider"
import {Badge, Button, ButtonGroup, Card} from "@heroui/react"
import { Icon } from "@iconify/react/dist/iconify.js"
import { useMemo, useRef, useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import {useMediaQuery} from "usehooks-ts";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {OrderStatusByDate} from "@/components/store/orders/dashboard/order-dashboard";

/**
 * Interface for storing order status information by date.
 * Maps a date string to booleans indicating if orders with specific
 * statuses exist for that date.
 */


/**
 * Props for the CalendarDashboard component.
 * Extends DayPicker component props with additional functionality
 * for range selection and order status display.
 *
 * @typedef CalendarDashboardProps
 * @property {Function} [onDateRangeChange] - Callback when date range changes
 * @property {boolean} [isLoading] - Whether the calendar is in loading state
 * @property {Object} [selected] - Currently selected date range
 * @property {Object} [statusIndicators] - Configuration for status indicators displayed on dates
 */
type CalendarDashboardProps = Omit<React.ComponentProps<typeof DayPicker>, 'mode'> & {
    onDateRangeChange?: (range: { from: Date; to: Date } | undefined) => void;
    isLoading?: boolean;
    selected?: { from: Date; to: Date };
    // Custom props for status indicators
    statusIndicators?: {
        new?: { color: string; label?: string };
        started?: { color: string; label?: string };
        ready?: { color: string; label?: string };
    };
    orderStatusByDate: OrderStatusByDate;
    setOrderStatusByDate: (status: OrderStatusByDate) => void;
}

/**
 * CalendarDashboard component displays a calendar with date range selection and order status indicators.
 * It allows selecting date ranges and shows different order statuses on each day using colored indicators.
 *
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {Object} [props.classNames] - Custom class names for calendar elements
 * @param {boolean} [props.showOutsideDays=true] - Whether to show days outside the current month
 * @param {Function} [props.onDateRangeChange] - Callback when date range changes
 * @param {boolean} [props.isLoading=false] - Whether the calendar is in loading state
 * @param {Object} [props.selected] - Currently selected date range
 * @param {Object} [props.statusIndicators] - Configuration for status indicators
 * @returns {JSX.Element} The calendar dashboard component
 */
function CalendarDashboard({
                               className,
                               classNames,
                               showOutsideDays = true,
                               onDateRangeChange,
                               isLoading = false,
                               selected,
                               orderStatusByDate,
                               setOrderStatusByDate,
                               statusIndicators = {
                                   new: { color: "#F31260", label: "new" },
                                   started: { color: "#F9C97C", label: "started" },
                                   ready: { color: "#3B82F6", label: "ready" }
                               },
                               ...props
                           }: CalendarDashboardProps) {
    const { store } = useStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPending, startTransition] = useTransition();
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const t = useTranslations("Calendar");

    // States for range selection with hover preview
    const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
    const [hoveredDay, setHoveredDay] = useState<Date | undefined>(undefined);
    const [range, setRange] = useState<{ from: Date; to: Date }>(
        selected || {
            from: new Date(),
            to: new Date()
        }
    );

    // Inside the component:
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Helper function to update search params
    const updateSearchParams = (from: Date, to: Date) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('from', formatApiDate(from));
        params.set('to', formatApiDate(to));
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Update range when selected prop changes
    React.useEffect(() => {
        if (selected) {
            setRange(selected);
        }
    }, [selected]);

    /**
     * Fetches orders for the current month and processes them to update
     * the order status indicators on the calendar.
     */
    React.useEffect(() => {
        if (!store?.id) return;

        const fetchOrdersForMonth = async () => {
            const monthStart = startOfMonth(currentMonth);
            const monthEnd = endOfMonth(currentMonth);

            try {
                const orders = await getOrdersByDateRange(
                    store.id,
                    formatApiDate(monthStart),
                    formatApiDate(monthEnd)
                );

                console.log(formatApiDate(monthStart))
                console.log(formatApiDate(monthEnd))
                console.log(orders)

                processOrderData(orders || []);
            } catch (error) {
                console.error("Error fetching monthly orders:", error);
            }
        };

        startTransition(() => {
            fetchOrdersForMonth();
        });
    }, [currentMonth, store?.id]);

    /**
     * Processes order data to create a map of statuses by date.
     * This is used to display status indicators on the calendar.
     *
     * @param {OrderData[]} orders - The array of orders to process
     */
    const processOrderData = (orders: OrderData[]) => {
        if (!orders.length) {
            setOrderStatusByDate({});
            return;
        }

        const statusMap: OrderStatusByDate = {};

        orders.forEach(order => {
            const orderDate = order.scheduled_time.date;

            if (!statusMap[orderDate]) {
                statusMap[orderDate] = {
                    new: false,
                    started: false,
                    ready: false,
                    new_count: 0,
                    started_count: 0,
                    ready_count: 0
                };
            }

            // Set the corresponding status flag
            if (order.order_status === 'new') {
                statusMap[orderDate].new = true;
                statusMap[orderDate].new_count++;
            }
            else if (order.order_status === 'started') {
                statusMap[orderDate].started = true;
                statusMap[orderDate].started_count++;
            }
            else if (order.order_status === 'ready') {
                statusMap[orderDate].ready = false;
                statusMap[orderDate].ready_count++;
            }
        });

        setOrderStatusByDate(statusMap);
    };

    /**
     * Handles month change in the calendar view.
     *
     * @param {Date} month - The new month selected
     */
    const handleMonthChange = (month: Date) => {
        setCurrentMonth(month);
    };

    /**
     * Handles day click for implementing two-step date range selection.
     * First click selects the start date, second click completes the range.
     *
     * @param {Date} day - The clicked day
     */
    const handleDayClick = (day: Date) => {
        if (!selectedDay) {
            // First click - select start date
            setSelectedDay(day);
            setRange({ from: day, to: day });
        } else {
            // Second click - complete the range
            let newRange;
            if (isBefore(day, selectedDay)) {
                newRange = { from: day, to: selectedDay };
            } else {
                newRange = { from: selectedDay, to: day };
            }

            setRange(newRange);
            setSelectedDay(undefined); // Reset for next selection
            console.log(newRange)
            onDateRangeChange?.(newRange);

            // Update URL search params
            updateSearchParams(newRange.from, newRange.to);
        }
    };

    // Handle hover effect after first selection
    const handleDayMouseEnter = (day: Date) => {
        if (selectedDay && (!hoveredDay || !isSameDay(day, hoveredDay))) {
            setHoveredDay(day);
        }
    };

    // Reset hover state when mouse leaves the calendar
    const handleMouseLeave = () => {
        setHoveredDay(undefined);
    };

    /**
     * Creates a unified range object for display based on current selection state.
     * Handles different stages of the selection process including hover preview.
     *
     * @returns {Object} The display range to be used by the calendar
     */
    const displayRange = useMemo(() => {
        // If we have a full selection, use it
        if (range.from && range.to && !selectedDay) {
            return range;
        }

        // If we have a first selection and are hovering, show preview
        if (selectedDay && hoveredDay) {
            if (isBefore(hoveredDay, selectedDay)) {
                return { from: hoveredDay, to: selectedDay };
            } else {
                return { from: selectedDay, to: hoveredDay };
            }
        }

        // If only first selection, show just that day
        if (selectedDay) {
            return { from: selectedDay, to: selectedDay };
        }

        return range;
    }, [range.from, range.to, selectedDay, hoveredDay]);

    /**
     * Handles click on "Today" button to select just today.
     */
    const handleTodayClick = () => {
        const today = new Date();
        setRange({ from: today, to: today });
        setSelectedDay(undefined);
        onDateRangeChange?.({ from: today, to: today });
    };

    /**
     * Handles click on "This Week" button to select from today to end of current week.
     */
    const handleThisWeekClick = () => {
        const today = new Date();
        const endWeek = endOfWeek(today, { weekStartsOn: 1 });
        setRange({ from: today, to: endWeek });
        setSelectedDay(undefined);
        onDateRangeChange?.({ from: today, to: endWeek });
    };

    /**
     * Handles click on "This Month" button to select from today to end of current month.
     */
    const handleThisMonthClick = () => {
        const today = new Date();
        const endMonth = endOfMonth(today);
        setRange({ from: today, to: endMonth });
        setSelectedDay(undefined);
        onDateRangeChange?.({ from: today, to: endMonth });
    };


    /**
     * Custom Day component that renders each day in the calendar with status indicators.
     *
     * @param {DayProps} props - The day component props from react-day-picker
     * @returns {JSX.Element} The custom day component with status indicators
     */
    const CustomDay = (props: DayProps) => {
        const { date, displayMonth } = props;
        const isSmall = useMediaQuery("(max-width: 1146px)");

        // Get active modifiers for the day
        const activeModifiers = useActiveModifiers(date, displayMonth);

        // Get the day render data including button/div props
        const buttonRef = useRef<HTMLButtonElement>(null);
        //@ts-ignore
        const dayRender = useDayRender(date, displayMonth, buttonRef);

        // Format date key to match orderStatusByDate format
        const dateKey = format(date, 'yyyy-M-dd');

        // Get status for this date
        const dateStatus = orderStatusByDate[dateKey];

        // Create array of statuses that are true for this date
        const indicators = dateStatus
            ? Object.entries(dateStatus)
                .filter(([_, value]) => value === true)
                .map(([key]) => key)
            : [];

        // Use the appropriate props based on whether it's a button or div
        const elementProps = dayRender.isButton ? dayRender.buttonProps : dayRender.divProps;


        return (
            <>
                    <button
                        {...(dayRender.isButton ? dayRender.buttonProps : {})}
                        className={cn(
                            "relative w-full h-full flex flex-col",
                            elementProps.className,
                        )}
                        disabled={isLoading}
                        style={elementProps.style}
                        onClick={(e) => {
                            e.preventDefault()
                            handleDayClick(date)
                        }} // Ensure click works
                        onTouchEnd={(e) => {
                            e.preventDefault();
                            handleDayClick(date);
                        }} // Better touch support
                    >
                        <span className={cn('bg-danger rounded-full border-text border-2 text-xs sm:text-small px-0.5 text-white aspect-square',
                            (dateStatus?.new_count <= 0 || !dateStatus?.new_count) && 'bg-transparent border-transparent text-transparent'
                            )}>
                            {dateStatus?.new_count || 0}
                        </span>
                        {date.getDate()}
                        <span className={cn('bg-warning rounded-full border-text border-2 text-xs sm:text-small px-0.5 text-text aspect-square',
                            (dateStatus?.started_count <= 0 || !dateStatus?.started_count) && 'bg-transparent border-transparent text-transparent'
                            )}>
                            {dateStatus?.started_count || 0}
                        </span>
                    </button>

                 {/*Status indicators */}
                {/*{indicators.length > 0 && (*/}
                {/*    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 h-1.5">*/}
                {/*        {indicators.map((status) => (*/}
                {/*            <div*/}
                {/*                key={`${dateKey}-${status}`}*/}
                {/*                className="w-2.5 h-2.5 rounded-full"*/}
                {/*                style={{*/}
                {/*                    backgroundColor: statusIndicators[status as keyof typeof statusIndicators]?.color*/}
                {/*                }}*/}
                {/*                title={statusIndicators[status as keyof typeof statusIndicators]?.label}*/}
                {/*            />*/}
                {/*        ))}*/}
                {/*    </div>*/}
                {/*)}*/}
            </>
        );
    };

    return (
        <Card
            ref={containerRef}
            className="w-full px-0"
        >
            <div className="flex justify-center bg-content1">
                <ButtonGroup
                    fullWidth
                    className="px-3 max-w-full pb-2 pt-3 bg-content1 [&>button]:text-default-500 [&>button]:border-default-200/60"
                    radius="full"
                    size="sm"
                    variant="bordered"
                >
                    <Button onPress={handleTodayClick}>{t("Today")}</Button>
                    <Button onPress={handleThisWeekClick}>{t("This Week")}</Button>
                    <Button onPress={handleThisMonthClick}>{t("This Month")}</Button>
                </ButtonGroup>
            </div>

            <div className="relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center">
                        <div className="loading-spinner"></div>
                    </div>
                )}

                <DayPicker
                    mode="range"
                    selected={displayRange}
                    onDayClick={handleDayClick}
                    onDayMouseEnter={handleDayMouseEnter}
                    // onDayMouseLeave={handleMouseLeave}
                    showOutsideDays={showOutsideDays}
                    onMonthChange={handleMonthChange}
                    disabled={isLoading}
                    className={cn("w-full", className)}
                    weekStartsOn={1}
                    formatters={{
                        formatWeekdayName: (weekday) => format(weekday, 'EEE'),
                        formatDay: (day) => format(day, 'd')
                    }}
                    components={{
                        IconLeft: ({ ...props }) => <Icon icon={'solar:alt-arrow-left-linear'} width={16} {...props} />,
                        IconRight: ({ ...props }) => <Icon icon={'solar:alt-arrow-right-linear'} width={16} {...props} />,
                        Day: CustomDay
                    }}
                    classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4 w-full text-default-500 text-small font-medium",
                        caption: "flex justify-center px-3 pt-4 pb-0 relative items-center",
                        caption_label: "text-sm font-medium",
                        nav: "space-x-1 flex items-center",
                        nav_button: cn(
                            "h-8 w-8 bg-transparent p-0 te opacity-100 hover:opacity-50 border border-2 border-default-300 rounded-full flex items-center text-medium text-default-400 justify-center"
                        ),
                        nav_button_previous: "absolute left-3",
                        nav_button_next: "absolute right-3",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex relative text-default-400 bg-content1 px-4 pb-2 shadow-[0px_20px_20px_0px_rgb(0_0_0/0.05)]",
                        tbody: 'bg-default-50',
                        head_cell: "flex justify-center items-center font-medium text-small w-full",
                        row: "flex w-full my-8 px-4",
                        cell: "w-full text-base text-center p-0 relative flex-1 py-0.5 px-0 flex items-center justify-center aspect-square [&:has([aria-selected].day-outside)]:bg-primary-100 [&:has([aria-selected])]:bg-primary-100 first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full [&:has([aria-selected].day-range-start)]:rounded-l-full [&:has([aria-selected].day-range-end)]:rounded-r-full",
                        day: cn(
                            "flex items-center text-foreground justify-center w-full h-full rounded-full",
                            "box-border appearance-none select-none whitespace-nowrap font-normal",
                            "relative overflow-visible",
                            "outline-none focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2",
                            "transition-[transform,background-color,color] !duration-150"
                        ),
                        day_outside: "text-default-300 before:hidden",
                        day_disabled: "text-default-300 cursor-default",
                        day_range_start: cn(
                            "day-range-start",
                            "bg-primary-500 text-black"
                        ),
                        day_range_end: cn(
                            "day-range-end",
                            "bg-primary-500 text-black"
                        ),
                        day_selected: "shadow-none",
                        day_today: "border-2 border-text",
                        day_hidden: "invisible",
                        ...classNames,
                    }}
                    {...props}
                />
            </div>

            {/* Status Indicators Legend */}
            {/*<div className="flex items-center justify-center gap-4 p-2 mt-2">*/}
            {/*    {Object.entries(statusIndicators).map(([key, { color, label }]) => (*/}
            {/*        <div key={key} className="flex items-center gap-1.5">*/}
            {/*            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>*/}
            {/*            <span className="text-xs text-default-500">{label}</span>*/}
            {/*        </div>*/}
            {/*    ))}*/}
            {/*</div>*/}
        </Card>
    );
}

CalendarDashboard.displayName = "CalendarDashboard";

export { CalendarDashboard };