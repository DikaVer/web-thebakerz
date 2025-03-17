"use client";
import React from "react";
import {Icon} from "@iconify/react";
import {Button} from "@heroui/react";
import {useRouter} from "next/navigation";
import {StoreData} from "@/lib/actions/store";
import {OrderData} from "@/lib/actions/order";
import GradientText from "@/components/ui/gradient-text";


interface OrderOverviewProps {
    storeData: StoreData;
    orderData: OrderData;
}

export const BakerzNotes: React.FC<OrderOverviewProps> = ({storeData, orderData}) => {

    const router = useRouter();

    return (
        <div className={'flex flex-col w-full max-w-2xl'}>
            <p>
                Order
            </p>
            <GradientText>
                #{orderData.store_order_id}
            </GradientText>
        </div>
    );
};
