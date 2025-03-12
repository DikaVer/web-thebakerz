'use client';
import { Accordion, AccordionItem, Button, Divider, Spacer } from "@heroui/react";
import { Icon } from "@iconify/react";
import TwoStepAuthForm from "@/components/authentication/two-step-auth-form";
import React, { useState } from "react";
import { useSession } from "@/components/providers/session-provider";
import NotFound from "@/app/(error_layout)/not-found";
import { ScheduleOrder } from "@/components/checkout/schedule/schedule-order";
import CartCheckout from "@/components/checkout/schedule/cart-checkout";
import { replaceGuestCart } from "@/lib/actions/cart";
import { useStore } from "@/components/providers/store-provider";
import showErrorMessage from "@/components/toast/toast-error";
import Checkout from "@/components/checkout/payment/checkout";
import CartOrder from "@/components/store/orders/add/cart-order";
import {ScheduleBakerzOrder} from "@/components/store/orders/add/schedule-bakerz-order";


export default function CheckoutOrder({ date, time }: { date: string | null; time: string | null }) {
    const { session } = useSession();

    const { store } = useStore();

    // Define steps as strings "1", "2", "3", "4"
    const steps = ["1", "2", "3", "4"];
    // Start at step 2 if user is logged in, otherwise start at step 1.
    const [currentStep, setCurrentStep] = useState<number>(1);

    // Allow all steps less than or equal to the current step to be accessible.
    // Only steps with a higher number than the current step remain disabled.
    const disabledKeys = steps.filter((key) => Number(key) > currentStep);

    const [ selectedKey, setSelectedKey ] = useState<string>(currentStep.toString());

    // Advances to the next step if not at the end.
    const handleNext = (key: number) => {
        if (currentStep < steps.length) {
            const nextStep = key > currentStep ? key : currentStep;
            setCurrentStep(nextStep);
            setSelectedKey(nextStep.toString());
        }
    };

    // Handler to place the order (add your order logic here).
    const handlePlaceOrder = () => {
        // Place order logic here...
    };

    return (
        <>
            <Accordion
                variant="splitted"
                className={'w-full px-0 gap-4'}
                selectionMode={'single'}
                selectedKeys={selectedKey}
                // expandedKeys={[currentStep.toString()]}
                disabledKeys={disabledKeys}
            >
                <AccordionItem
                    key="1"
                    className={'shadow-none border-1'}
                    aria-label="Cart Details"
                    title="1. Cart Details"
                    disableIndicatorAnimation
                    indicator={
                        1 < currentStep
                            ? <Icon icon={'solar:check-read-linear'} width={24} />
                            : <Icon icon={"solar:cart-large-minimalistic-broken"} className={'text-default-400'} width={24} />
                    }
                    onPress={() => {
                        setSelectedKey("1")
                        setCurrentStep(1);
                    }}
                >
                    <CartOrder handleNext={() => handleNext(2)}/>
                </AccordionItem>
                <AccordionItem
                    key="2"
                    className={'shadow-none border-1'}
                    aria-label="Pick Up Details"
                    title="2. Pick Up Details"
                    disableIndicatorAnimation
                    indicator={
                        2 < currentStep
                            ? <Icon icon={'solar:check-read-linear'} width={24} />
                            : <Icon icon={"solar:clock-circle-broken"} className={'text-default-400'} width={24} />
                    }
                    onPress={() => {
                        setSelectedKey("2")
                    }}
                >
                    <ScheduleBakerzOrder
                        dateParam={date}
                        timeParam={time}
                        handleNext={() => handleNext(3)}

                    />
                </AccordionItem>
            </Accordion>

        </>
    );
}
