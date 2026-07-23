/**
 * @fileoverview Client component showing the order status card on the order overview page.
 *
 * Exports OrderStatusCard, which maps the order's status to a step index and
 * renders a HorizontalStepsOrder progress indicator (placed, cooking, ready,
 * completed/cancelled) together with an OrderStatusChip and relevant dates.
 */
"use client";
import React from "react";
import {useRouter} from "next/navigation";
import {StoreData} from "@/lib/actions/store";
import {OrderData, OrderStatus} from "@/lib/actions/order";
import {Card, CardBody, CardHeader, Divider, Spacer} from "@heroui/react";
import {Icon} from "@iconify/react";
import {formatDisplayDate, formatDisplayTime, formatScheduledDate, formatScheduledTime} from "@/lib/utils";
import {useLocale, useTranslations} from "next-intl";
import HorizontalStepsOrder from "@/components/store/orders/overview/horizontal-steps-order";
import {OrderStatusChip} from "@/components/ui/status-chip";


interface OrderStatusProps {
    orderData: OrderData;
}


export const OrderStatusCard: React.FC<OrderStatusProps> = ({orderData}) => {
    const locale = useLocale();
    const t = useTranslations("app/(store)/components/orders/overview");

    const status = (order_status: string) => {
        switch (order_status) {
            case "new":
                return 0;
            case "started":
                return 1;
            case "ready":
                return 2;
            case "completed":
                return 3;
            case "cancelled":
                return 3;
            default:
                return 4;
        }
    }

    const completed = orderData.order_status !== "cancelled" ? t("completed") : t("Cancelled");
    const completedTime = orderData.order_status !== "cancelled" ? (
        <>
            <div>{formatScheduledDate(orderData.scheduled_time, locale)}</div>
            {!orderData.isPostDelivery && <div>at {formatScheduledTime(orderData.scheduled_time, locale)}</div>}
        </>
    ) : orderData.cancelledAt && formatDisplayDate(orderData.cancelledAt, locale);

    return (
        <div className={'flex flex-col w-full max-w-2xl'}>
            <Card shadow="none">
                <CardHeader
                    className={'flex flex-col items-start'}
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
                    <Divider />
                </CardHeader>
                <CardBody
                    className={'flex justify-center items-center'}
                >
                    <HorizontalStepsOrder
                        orderData={orderData}
                        defaultStep={status(orderData.order_status)}
                        steps={[
                            {
                                title: t("Placed"),
                                description: formatDisplayDate(orderData.createdAt, locale),
                            },
                            {
                                title: t("Cooking"),
                            },
                            {
                                title: t("Ready"),
                            },
                            {
                                title: completed,
                                description: completedTime,
                            }
                        ]}
                    />
                </CardBody>
            </Card>
        </div>
    );
};