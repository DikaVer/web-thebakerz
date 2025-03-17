"use client";
import React from "react";
import {Icon} from "@iconify/react";
import {Button, Spacer} from "@heroui/react";
import {useRouter} from "next/navigation";
import {StoreData} from "@/lib/actions/store";
import {OrderData} from "@/lib/actions/order";
import {OrderTopContent} from "@/components/store/orders/overview/components/top-content";
import {OrderStatusCard} from "@/components/store/orders/overview/components/order-status-card";
import {OrderCustomerDetails} from "@/components/store/orders/overview/components/customer-details";
import {OrderItems} from "@/components/store/orders/overview/components/order-items";
import {useStore} from "@/components/providers/store-provider";
import {useTranslations} from "next-intl";


interface OrderOverviewProps {
    storeData: StoreData;
    orderData: OrderData;
}

export const OrderOverview: React.FC<OrderOverviewProps> = ({storeData, orderData}) => {
    const { store } = useStore();
    const router = useRouter();
    const t = useTranslations("TheBakerz");
    const storeUrl = store?.storeName ? store?.storeName : store?.id;
    return (
        <div className={'flex flex-col w-full max-w-2xl container'}>
            <Button
                size="md"
                variant="light"
                className="text-default-500 max-w-fit px-0 pr-2"
                onPress={() => {
                    router.push(`/${storeUrl}/orders?date=${orderData.scheduled_time.date}`);
                }}
                startContent={
                    <Icon
                        className="text-default-500"
                        height={24}
                        icon="solar:alt-arrow-left-linear"
                        width={24}
                    />
                }
            >
                {t("Back to Order Dashboard")}
            </Button>
            <Spacer y={4}/>
            <OrderTopContent
                scheduleTime={orderData.scheduled_time}
                storeOrderId={orderData.store_order_id}
            />
            <Spacer y={8}/>
            <OrderStatusCard
                orderData={orderData}
            />
            <Spacer y={8}/>
            <OrderItems
                storeData={storeData}
                orderData={orderData}
            />
            <Spacer y={8}/>
            <OrderCustomerDetails
                customer={orderData.customer}
            />
            <Spacer y={8}/>
        </div>
    );
};