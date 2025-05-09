'use client';
import React from "react";
import { formatCurrency } from "@/lib/utils";

interface ProductInfoProps {
    name: string;
    price: number;
    description: string;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
    name,
    price,
    description
}) => {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center w-full">
                <p className={`font-semibold text-2xl`}>
                    {formatCurrency(price)}
                </p>
            </div>
            <p className={`text-base font-medium`}>
                {name}
            </p>
            <p className={'font-light text-sm whitespace-pre-wrap'}>{description}</p>
        </div>
    );
}; 