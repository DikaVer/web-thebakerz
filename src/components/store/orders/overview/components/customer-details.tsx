"use client";
import React from "react";
import {useRouter} from "next/navigation";
import {Customer} from "@/lib/actions/order";
import {Avatar, Card, CardBody, CardFooter, CardHeader, Divider, Spacer} from "@heroui/react";
import {IconMail} from "@/components/ui/icons";
import {Icon} from "@iconify/react";
import {useTranslations} from "next-intl";
import {DeliveryAddress} from "@/app/(store)/[id]/delivery-actions";

interface OrderCustomerDetailsProps {
    customer: Customer;
    address?: DeliveryAddress;
}

export const OrderCustomerDetails: React.FC<OrderCustomerDetailsProps> = ({customer, address}) => {
    const router = useRouter();
    const t = useTranslations("app/(store)/components/orders/overview");

    return (
        <div className={'flex flex-col w-full max-w-2xl'}>
            <Card shadow="none">
                <CardHeader
                    className={'flex flex-col items-start'}
                >
                    <Spacer y={2}/>
                    <div className={'flex justify-center items-center'}>
                        <Avatar 
                            size={'sm'} 
                            className={'bg-white'}
                            color={'primary'}
                            isBordered
                            src={"/profile/profile_1.png"}
                        />
                        <Spacer x={2}/> 
                        <p>{t("Customer Details")}</p>
                    </div>
                    <Spacer y={4}/>
                    <Divider />
                </CardHeader>
                <CardBody
                    className={'items-start justify-start pb-6'}
                >
                    <div className={'flex justify-center items-center'}>
                        <Icon icon={'stash:user-avatar'} className={'text-default-500'} width={24}/>
                        <Spacer x={2}/>
                        <p className={'text-default-500'}>{customer.name_customer}</p>
                    </div>
                    <Spacer y={4}/>
                    <div className={'flex justify-center items-center'}>
                        <IconMail className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                        <Spacer x={2}/>
                        <a href={`mailto:${customer.email_customer}`} className={'text-default-500 hover:underline'}>
                            {customer.email_customer}
                        </a>
                    </div>
                    {customer.phone_number &&
                        <>
                            <Spacer y={4}/>
                            <div className={'flex justify-center items-center'}>
                                <Icon icon={"solar:phone-calling-bold"} className="text-default-400 pointer-events-none flex-shrink-0" width={24}/>
                                <Spacer x={2}/>
                                <a href={`tel:${customer.phone_number}`} className={'text-default-500 hover:underline'}>
                                    {customer.phone_number}
                                </a>
                            </div>
                        </>
                    }
                    <Spacer y={4}/>
                    <Divider />
                    <Spacer y={4}/>
                    {address &&
                        <div className={'flex justify-center items-center'}>
                            <Icon icon={"solar:map-point-bold"} className="text-default-400 pointer-events-none flex-shrink-0" width={24}/>
                            <Spacer x={2}/>
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address.street}, ${address.city}, ${address.zipCode}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={'text-default-500 hover:underline'}
                            >
                                {address.street}, {address.city}, {address.zipCode}
                            </a>
                        </div>
                    }
                    {address && address.additionalInfo && (
                        <>
                            <Spacer y={4}/>
                            <div className={'flex justify-center items-center'}>
                                <Icon icon={"solar:info-circle-bold"} className="text-default-400 pointer-events-none flex-shrink-0" width={24}/>
                                <Spacer x={2}/>
                                <p className={'text-default-500'}>
                                    {address.additionalInfo}
                                </p>
                            </div>
                        </>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};