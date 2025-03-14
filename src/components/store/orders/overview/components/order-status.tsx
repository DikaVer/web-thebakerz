"use client";
import React from "react";
import {useRouter} from "next/navigation";
import {StoreData} from "@/lib/actions/store";
import {OrderData} from "@/lib/actions/order";
import {Card, CardBody, CardHeader, Divider, Spacer} from "@heroui/react";
import {Icon} from "@iconify/react";
import {formatDisplayDate, formatDisplayTime} from "@/lib/utils";
import {useLocale} from "next-intl";
import HorizontalStepsOrder from "@/components/store/orders/overview/horizontal-steps-order";


interface OrderStatusProps {
    storeData: StoreData;
    orderData: OrderData;
}

export const OrderStatus: React.FC<OrderStatusProps> = ({storeData, orderData}) => {

    const router = useRouter();
    const locale = useLocale();

    const status =  (order_status: string) => {
        switch (order_status) {
            case "new":
                return 0;
            case "started":
                return 1;
            case "ready":
                return 2;
            case "completed":
                return 3;
            default:
                return 4;
        }
    }

    const completed = orderData.order_status !== "cancelled" ? "Picked Up" : "Cancelled";
    const completedTime = orderData.order_status !== "cancelled" ? (
        <>
            <div>{formatDisplayDate(orderData.scheduled_time.date, locale)}</div>
            <div>at {formatDisplayTime(orderData.scheduled_time.date + " " + orderData.scheduled_time.time, locale)}</div>
        </>
    ) : orderData.cancelledAt && formatDisplayDate(orderData.cancelledAt, locale);

    return (
        <div className={'flex flex-col w-full max-w-2xl'}>
            <Card>
                <CardHeader
                    className={'flex flex-col items-start'}
                >
                    <Spacer y={2}/>
                    <div className={'flex justify-center items-center'}>
                        <Icon icon={"solar:info-circle-linear"} width={24} height={24}/>
                        <Spacer x={2}/>
                        <p>Order Status</p>
                    </div>
                    <Spacer y={4}/>
                    <Divider />
                </CardHeader>
                <CardBody
                    className={'flex justify-center items-center'}
                >
                    <HorizontalStepsOrder
                        defaultStep={status(orderData.order_status)}
                        steps={[
                            {
                                title: "Placed",
                                description: formatDisplayDate(orderData.createdAt, locale),
                            },
                            {
                                title: "Cooking",
                            },
                            {
                                title: "Ready",
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
