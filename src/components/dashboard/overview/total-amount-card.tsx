/**
 * @fileoverview Summary card displaying the total processed order amount.
 *
 * Renders a HeroUI card with a wallet icon and the formatted total currency
 * value of all orders, used on the dashboard overview page.
 */
"use client";

import React from 'react';
import { Card, CardBody, CardHeader } from "@heroui/react";
import { formatCurrency } from '@/lib/utils'; // Assuming you have a currency formatter
import { Icon } from '@iconify/react';

interface TotalAmountCardProps {
    totalAmount: number;
}

const TotalAmountCard: React.FC<TotalAmountCardProps> = ({ totalAmount }) => {

    return (
        <Card shadow="none" className="h-full">
            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                <p className="text-tiny uppercase font-bold">Total Amount</p>
                <small className="text-default-500">Total amount of orders</small>
            </CardHeader>
            <CardBody className="overflow-visible py-2 flex flex-row items-center justify-center">
                 <Icon icon="solar:wallet-money-bold-duotone" width="48" className="text-primary mr-4"/>
                <h4 className="font-bold text-large text-center">{formatCurrency(totalAmount)}</h4>
            </CardBody>
        </Card>
    );
};

export default TotalAmountCard; 