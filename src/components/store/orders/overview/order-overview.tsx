"use client";
import React from "react";
import {Icon} from "@iconify/react";
import {Button, Spacer} from "@heroui/react";
import {useRouter} from "next/navigation";
import {StoreData} from "@/lib/actions/store";
import {OrderData} from "@/lib/actions/order";
import GradientText from "@/components/ui/gradient-text";
import {OrderTopContent} from "@/components/store/orders/overview/components/top-content";
import {OrderStatus} from "@/components/store/orders/overview/components/order-status";
import {OrderCustomerDetails} from "@/components/store/orders/overview/components/customer-details";
import {OrderItems} from "@/components/store/orders/overview/components/order-items";
import {useStore} from "@/components/providers/store-provider";


interface OrderOverviewProps {
    storeData: StoreData;
    orderData: OrderData;
}

export const  OrderOverview: React.FC<OrderOverviewProps> = ({storeData, orderData}) => {
    const { store } = useStore();
    const router = useRouter();

    return (
        <div className={'flex flex-col w-full max-w-2xl container'}>
            <Button
                size="md"
                variant="light"
                className="text-default-500 max-w-fit px-0 pr-2"
                onPress={() => {
                    router.push(`/${store.storeName}/orders?date=${orderData.scheduled_time.date}`);
                    router.refresh();
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
                Back to Order Dashboard
            </Button>
            <Spacer y={4}/>
            <OrderTopContent
                storeData={storeData}
                orderData={orderData}
            />
            <Spacer y={8}/>
            <OrderStatus
                storeData={storeData}
                orderData={orderData}
            />
            <Spacer y={8}/>
            <OrderItems
                storeData={storeData}
                orderData={orderData}
            />
            <Spacer y={8}/>
            <OrderCustomerDetails
                orderData={orderData}
            />
            <Spacer y={8}/>
        </div>
    );
};
