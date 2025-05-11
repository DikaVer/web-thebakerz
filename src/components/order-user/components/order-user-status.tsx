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


export const OrderUserStatus: React.FC<OrderStatusProps> = ({orderData}) => {
    const locale = useLocale();
    const t = useTranslations("app/(store)/components/orders/overview");

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
                </CardHeader>
            </Card>
        </div>
    );
};