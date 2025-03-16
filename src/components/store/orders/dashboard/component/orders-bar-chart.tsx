"use client";

import {ButtonProps, CardProps, Spacer} from "@heroui/react";

import React, { useMemo, useState } from "react";
import {ResponsiveContainer, PieChart, Pie, Tooltip, Cell, Label} from "recharts";
import {
    Card,
    Button,
    Select,
    SelectItem,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    cn,
} from "@heroui/react";
import {Icon} from "@iconify/react";
import {OrderData} from "@/lib/actions/order";
import {motion} from "framer-motion";
import {getStatusColor} from "@/components/ui/status-chip";
import {formatCurrency} from "@/lib/utils";
import {useTranslations} from "next-intl";

type ChartData = {
    name: string;
    value: number;
    count: number;
    amount: number;
};

type CircleChartProps = {
    title: string;
    total: number;
    unit?: string;
    color: ButtonProps["color"];
    categories: string[];
    chartData: ChartData[];
};

interface OrdersBarChartProps {
    orderDataList: OrderData[];
    isLoading: boolean;
}

// Add this helper function to extract the color:
const getBgColorFromClass = (classStr: string): string => {
    const colorMap: Record<string, string> = {
        "bg-blue-500": "#3b82f6",
        "bg-purple-100": "#ede9fe",
        "bg-danger-500": "#F31260",
        "bg-warning-300": "#F9C97C",
        "bg-success-500": "#17C964",
        "bg-default-300": "#D4D4D8",
    };

    for (const [className, hexColor] of Object.entries(colorMap)) {
        if (classStr.includes(className)) {
            return hexColor;
        }
    }

    return "#CCCCCC"; // Default color if no match found
};


export const OrdersBarChart: React.FC<OrdersBarChartProps> = ({orderDataList, isLoading = false}) => {
    const barT = useTranslations("BarChartDashboard");
    // Process order data to get stats by status
    const { chartData, categories, totalAmount, totalOrders } = useMemo(() => {
        // Count and sum orders by status
        const statusMap = new Map<string, { amount: number, count: number }>();

        orderDataList.forEach(order => {
            const status = order.order_status;
            const currentData = statusMap.get(status) || { amount: 0, count: 0 };

            statusMap.set(status, {
                amount: currentData.amount + order.amount,
                count: currentData.count + 1
            });
        });

        // Convert to chart data format
        const statusOrder = ["new", "started", "ready", "completed", "cancelled"];
        const data: ChartData[] = [];
        const cats: string[] = [];
        let total = 0;

        statusOrder.forEach(status => {
            if (statusMap.has(status)) {
                const value = statusMap.get(status)!;
                data.push({
                    name: status,
                    value: value.count,
                    count: value.count,
                    amount: value.amount,
                });
                cats.push(status);
                total += value.amount;
            }
        });

        return {
            chartData: data,
            categories: cats,
            totalAmount: total,
            totalOrders: orderDataList.length
        };
    }, [orderDataList]);

    const chartConfig: CircleChartProps = {
        title: barT("Title"),
        total: totalAmount,
        unit: "EUR",
        categories,
        color: "primary",
        chartData
    };

    return (
        <dl className="w-full">
            <CircleChartCard
                key={1}
                isLoading={isLoading}
                orderCount={totalOrders}
                {...chartConfig}
            />
        </dl>
    );
};

const formatTotal = (total: number) => {
    // Convert cents to euros by dividing by 100
    const euros = total / 100;
    return euros >= 1000 ? `${(euros / 1000).toFixed(1)}K` : euros.toFixed(2);
};

const CircleChartCard = React.forwardRef<
    HTMLDivElement,
    Omit<CardProps, "children"> & CircleChartProps & { isLoading?: boolean, orderCount?: number }
>(({className, title, total, unit, categories, color, chartData, isLoading = false, orderCount = 0, ...props}, ref) => {
    // State for selected statuses, initialize with all categories
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([...categories]);
    const t = useTranslations("OrderStatus");
    const barT = useTranslations("BarChartDashboard");

    // Filter chart data based on selected statuses
    const filteredChartData = useMemo(() => {
        if (selectedStatuses.length === 0) return chartData;
        return chartData.filter(item => selectedStatuses.includes(item.name));
    }, [chartData, selectedStatuses]);

    // Calculate filtered totals
    const filteredTotal = useMemo(() => {
        return filteredChartData.reduce((sum, item) => sum + item.amount, 0);
    }, [filteredChartData]);

    const filteredOrderCount = useMemo(() => {
        return filteredChartData.reduce((sum, item) => sum + item.count, 0);
    }, [filteredChartData]);

    // Handle status selection change
    const handleStatusChange = (keys: any) => {
        // HeroUI's Select component returns a Set for multiple selection mode
        if (keys instanceof Set) {
            setSelectedStatuses(Array.from(keys) as string[]);
        } else {
            setSelectedStatuses(Array.isArray(keys) ? keys : [keys]);
        }
    };

    if (isLoading) {
        return (
            <Card
                ref={ref}
                className={cn("min-h-[280px] border border-transparent dark:border-default-100", className)}
                {...props}
            >
                <div className={'flex flex-col items-center justify-center min-h-[280px]'}>
                    <div className="animate-spin mb-4">
                        <Icon icon="eos-icons:loading" width={48} />
                    </div>
                </div>
            </Card>
        );
    }


    return (
        <Card
            ref={ref}
            className={cn("min-h-[280px] border border-transparent dark:border-default-100", className)}
            {...props}

        >
            <div className="flex flex-col gap-y-2 p-4 pb-0">
                <div className="flex items-center justify-between gap-x-2">
                    <dt>
                        <h3 className="text-small font-medium text-default-500">{title}</h3>
                    </dt>
                    <div className="flex items-center justify-end gap-x-2">
                        <Select
                            aria-label="Order status filter"
                            classNames={{
                                trigger: "min-w-[100px] max-w-[150px] min-h-7 h-7",
                                value: "text-tiny !text-default-500 truncate w-[100%]",
                                selectorIcon: "text-default-500",
                                popoverContent: "min-w-[120px]",
                                base: "max-w-full",
                                mainWrapper: "max-w-full",
                            }}
                            listboxProps={{
                                itemClasses: {
                                    title: "text-tiny",
                                },
                            }}
                            placeholder="All"
                            selectionMode="multiple"
                            size="sm"
                            selectedKeys={selectedStatuses}
                            onSelectionChange={handleStatusChange}
                            defaultSelectedKeys={categories}
                        >
                            {categories.map((cat) => (
                                <SelectItem key={cat}>{t(cat.toLowerCase() || "unknown")}</SelectItem>
                            ))}
                        </Select>
                        <Dropdown
                            classNames={{
                                content: "min-w-[120px]",
                            }}
                            placement="bottom-end"
                        >
                            <DropdownTrigger>
                                <Button isIconOnly radius="full" size="sm" variant="light">
                                    <Icon height={16} icon="solar:menu-dots-bold" width={16} />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                itemClasses={{
                                    title: "text-tiny",
                                }}
                                variant="flat"
                            >
                                <DropdownItem startContent={
                                    <div className={'w-[24px]'}>
                                        <Icon icon={'solar:printer-minimalistic-bold'} width={24} height={24}/>
                                    </div>
                                } key="view-details">
                                    {barT("Print")}
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </div>
            </div>
            {/*check if list is not empty*/}
            {filteredChartData.length === 0 ? (
                <div className="p-8 flex flex-col items-center justify-center">
                    <Icon icon="solar:clipboard-list-broken" width={48} className="text-default-500" />
                    <Spacer y={2} />
                    <p className="text-default-500">{barT("Not Found")}</p>
                </div>
            ) : (
                <div className="flex h-full flex-wrap items-center justify-center gap-x-2 lg:flex-nowrap">
                    <ResponsiveContainer
                        className="w-full max-w-[200px] [&_.recharts-surface]:outline-none"
                        height={200}
                        width="100%"
                    >
                        <PieChart accessibilityLayer margin={{top: 0, right: 0, left: 0, bottom: 0}}>
                            <Tooltip
                                content={({label, payload}) => (
                                    <div className="flex flex-col min-h-[120px] min-w-[160px] rounded-medium bg-background px-3 py-2 text-tiny shadow-small">
                                        {payload?.map((p, index) => {
                                            const data = p.payload as ChartData;

                                            return (
                                                <div key={`${index}-${data.name}`}>
                                                    <div className={'flex justify-between items-center'}>
                                                        <span
                                                            className="font-medium text-foreground mb-1">
                                                            {t(data.name.toLowerCase() || "unknown")} Orders
                                                        </span>
                                                        <div
                                                            className={cn("h-2 w-2 flex-none rounded-full",
                                                                getStatusColor(data.name)
                                                            )}
                                                        />
                                                    </div>
                                                    <div
                                                        className="flex w-full items-center gap-x-2 my-1">
                                                        <div className="flex w-full flex-col">
                                                            <div className="flex justify-between text-xs text-default-700">
                                                                <span>Count:</span>
                                                                <span className="font-mono font-medium">{data.count}</span>
                                                            </div>
                                                            <div className="flex justify-between text-xs text-default-700">
                                                                <span>Amount:</span>
                                                                <span
                                                                    className="font-mono font-medium">{formatCurrency(data.amount)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                cursor={false}
                            />
                            <Pie
                                animationDuration={1000}
                                animationEasing="ease"
                                cornerRadius={12}
                                data={filteredChartData}
                                dataKey="value"
                                innerRadius="68%"
                                nameKey="name"
                                paddingAngle={-20}
                                strokeWidth={0}
                            >
                                {filteredChartData.map((item, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={getStatusColor(item.name).includes("bg-") ?
                                            getBgColorFromClass(getStatusColor(item.name)) :
                                            "#CCCCCC"}
                                    />
                                ))}
                                <Label
                                    content={({viewBox}) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text
                                                    dominantBaseline="auto"
                                                    textAnchor="middle"
                                                    x={viewBox.cx!}
                                                    y={viewBox.cy!}
                                                >
                                                    <tspan
                                                        fill="hsl(var(--heroui-default-700))"
                                                        fontSize={20}
                                                        fontWeight={600}
                                                        x={viewBox.cx!}
                                                        y={viewBox.cy!}
                                                    >
                                                        €{formatTotal(filteredTotal)}
                                                    </tspan>
                                                    <tspan
                                                        fill="hsl(var(--heroui-default-500))"
                                                        fontSize={12}
                                                        fontWeight={500}
                                                        x={viewBox.cx!}
                                                        y={viewBox.cy! + 14}
                                                    >
                                                        {filteredOrderCount} orders
                                                    </tspan>
                                                </text>
                                            );
                                        }

                                        return null;
                                    }}
                                    position="center"
                                />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="flex w-full flex-col justify-center gap-4 p-4 text-tiny text-default-500 lg:p-0">
                        {filteredChartData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={cn("h-2 w-2 rounded-full",
                                            getStatusColor(item.name)
                                        )}
                                    />
                                    <span>{t(item.name.toLowerCase() || "unknown")}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
});

CircleChartCard.displayName = "CircleChartCard";