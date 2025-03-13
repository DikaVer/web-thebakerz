'use client';

import React, { useState } from "react";
import ProductList from "@/components/store/orders/add/product-list";
import CheckoutOrder from "@/components/store/orders/add/checkout-order";
import {ProductDataFull} from "@/lib/actions/product";
import { Spacer } from "@heroui/react";


interface CartOrderCompProps {
    productsData: ProductDataFull;
    productsOrder: Record<string, string[]>;
}

export default function CartOrderComp({ productsData, productsOrder }: CartOrderCompProps) {
    const [currentStep, setCurrentStep] = useState(1);
    return (
        <>
            <ProductList
                currentStep={currentStep}
                productsData={productsData}
                productsOrder={productsOrder}
            />
            <Spacer y={4}/>
            <CheckoutOrder currentStep={currentStep} setCurrentStep={setCurrentStep} date={null} time={null}/>
        </>

    );
}