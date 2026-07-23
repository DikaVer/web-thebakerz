/**
 * @fileoverview Order status card for a customer's order.
 *
 * Exports the OrderUserStatus component, which displays the order's current
 * status as a chip and a link to the store the order was placed from.
 */
"use client";
import React from "react";
import {useRouter} from "next/navigation";
import {StoreData} from "@/lib/actions/store";
import {OrderData, OrderStatus} from "@/lib/actions/order";
import {Card, CardBody, CardHeader, Divider, Link, Spacer} from "@heroui/react";
import {Icon} from "@iconify/react";
import {formatDisplayDate, formatDisplayTime, formatScheduledDate, formatScheduledTime} from "@/lib/utils";
import {useLocale, useTranslations} from "next-intl";
import HorizontalStepsOrder from "@/components/store/orders/overview/horizontal-steps-order";
import {OrderStatusChip} from "@/components/ui/status-chip";


interface OrderStatusProps {
    orderData: OrderData;
}


export const OrderUserStatus: React.FC<OrderStatusProps> = ({orderData}) => {
    const locale = useLocale();
    const t = useTranslations("app/(store)/components/orders/overview");
    const router = useRouter();

    return (
        <div className={'flex flex-col w-full max-w-2xl'}>
            <Card shadow="none">
                <CardHeader
                    className={'flex flex-col items-start w-full'}
                >
                    <Spacer y={2}/>
                    <div className={'flex justify-center items-center'}>
                        <Icon icon={"solar:info-circle-linear"} width={24} height={24}/>
                        <Spacer x={2}/>
                        <p>{t("Order Status")}</p>
                        <Spacer x={2}/>
                        <OrderStatusChip
                            size={'sm'}
                            status={orderData.order_status}
                        />
                    </div>
                    <Spacer y={4}/>
                    <div className="flex items-center">
                        <Icon icon={"solar:shop-linear"} width={24} height={24}/>
                        <Spacer x={2}/>
                        <p className="text-sm font-medium">{t("OrderFrom")}:</p>
                        <Spacer x={2}/>
                        <Link 
                            href={`/${orderData.store_id}`}
                            className="text-sm font-semibold hover:underline"
                            color="primary"
                        >
                            {orderData.store_name}
                            <Icon icon="solar:arrow-right-up-linear" className="text-primary" width={14} height={14}/>
                        </Link>
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
};