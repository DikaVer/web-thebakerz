"use client";
import React from "react";
import {useRouter} from "next/navigation";
import {OrderData} from "@/lib/actions/order";
import {Avatar, Card, CardBody, CardFooter, CardHeader, Divider, Spacer} from "@heroui/react";
import {IconMail} from "@/components/ui/icons";


interface OrderCustomerDetailsProps {
    orderData: OrderData;
}

export const OrderCustomerDetails: React.FC<OrderCustomerDetailsProps> = ({orderData}) => {

    const router = useRouter();

    return (
        <div className={'flex flex-col w-full max-w-2xl'}>
            <Card>
                <CardHeader
                    className={'flex flex-col items-start'}
                >
                    <Spacer y={2}/>
                    <div className={'flex justify-center items-center'}>
                        <Avatar size={'sm'} className={'bg-background'}/>
                        <Spacer x={2}/>
                        <p>Customer Details</p>
                    </div>
                    <Spacer y={4}/>
                    <Divider />
                </CardHeader>
                <CardBody
                    className={'items-start justify-start pb-6'}
                >
                    <div className={'flex justify-center items-center'}>
                        <IconMail className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                        <Spacer x={2}/>
                        <p className={'text-default-500'}>{orderData.email_customer}</p>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};
