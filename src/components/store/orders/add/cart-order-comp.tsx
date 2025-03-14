'use client';

import React, { useState } from "react";
import ProductList from "@/components/store/orders/add/product-list";
import CheckoutOrder from "@/components/store/orders/add/checkout-order";
import {ProductDataFull} from "@/lib/actions/product";
import {Button, Spacer} from "@heroui/react";
import {Icon} from "@iconify/react";
import {useRouter} from "next/navigation";
import {useStore} from "@/components/providers/store-provider";


interface CartOrderCompProps {
    productsData: ProductDataFull;
    productsOrder: Record<string, string[]>;
}

export default function CartOrderComp({ productsData, productsOrder }: CartOrderCompProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const router = useRouter();
    const { store } = useStore();
    return (
        <>
            <Spacer y={4}/>
            <Button
                size="md"
                variant="light"
                className="text-default-500 max-w-fit px-0 pr-1"
                onPress={() => {
                    router.push(`/${store.storeName}/orders`);
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