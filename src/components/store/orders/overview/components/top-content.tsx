"use client";
import React from "react";
import {Icon} from "@iconify/react";
import {Button, Spacer} from "@heroui/react";
import {StoreData} from "@/lib/actions/store";
import {OrderData} from "@/lib/actions/order";
import GradientText from "@/components/ui/gradient-text";
import {formatDisplayDateTime} from "@/lib/utils";
import {useLocale} from "next-intl";


interface OrderTopContentProps {
    storeData: StoreData;
    orderData: OrderData;
}

export const OrderTopContent: React.FC<OrderTopContentProps> = ({storeData, orderData}) => {

    const locale = useLocale();

    const pickUpTime = `${orderData.scheduled_time.date} ${orderData.scheduled_time.time}`;

    return (
        <section id={'Order Top Content'} className={'flex justify-between'}>
            <div className={'flex flex-col w-full max-w-2xl'}>

                <div className={'flex'}>
                    <p>
                        Order
                    </p>
                    <Spacer x={1}/>
                    <GradientText>
                        #{orderData.order_id}
                    </GradientText>
                </div>
                <p className={'text-sm font-light text-default-600'}>{formatDisplayDateTime(pickUpTime, locale)}</p>
            </div>
            <Button
                startContent={
                    <div className={'w-[24px]'}>
                    <Icon icon={'solar:printer-minimalistic-bold'} width={24} height={24}/>
                    </div>
                }
                color="primary"
                className={'bg-gradient-primary px-8'}

            >
                Print Invoice
            </Button>
        </section>
    );
};
