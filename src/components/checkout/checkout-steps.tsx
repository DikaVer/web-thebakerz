'use client';
import {Accordion, AccordionItem, Button, Divider, Spacer} from "@heroui/react";
import {Icon} from "@iconify/react";
import TwoStepAuthForm from "@/components/authentication/two-step-auth-form";
import React, {useState} from "react";
import {useSession} from "@/components/providers/session-provider";
import NotFound from "@/app/(error_layout)/not-found";
import {ScheduleOrder} from "@/components/checkout/schedule/schedule-order";
import {ScrollShadow} from "@heroui/scroll-shadow";
import CartCheckout from "@/components/checkout/schedule/cart-checkout";
import {replaceGuestCart} from "@/lib/actions/cart";
import {useStore} from "@/components/providers/store-provider";
import showErrorMessage from "@/components/toast/toast-error";
import showSuccessMessage from "@/components/toast/toast-succes";

export default function CheckoutSteps({ date, time }: { date: string | null; time: string | null }) {
    const defaultContent =
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

    const { session }  = useSession();


    if (session?.store) {
        return NotFound();
    }

    const { store } = useStore();

    // Steps: "1", "2", "3", "4"
    const steps = ["1", "2", "3", "4"];
    const [currentStep, setCurrentStep] = useState<number>(session.user ? 2 : 1);


    // Only allow the current step to be expanded.
    const expandedKeys = [String(currentStep)];
    const disabledKeys = steps.filter((key) => key !== String(currentStep));

    const handleLogin = async (value: boolean) => {
        const result = await replaceGuestCart(store.id);
        if (result.success) {
            handleNext();
        } else {
            showErrorMessage({error: "Failed to update cart."});
        }
        console.log('Login');
    }

    // Handler for advancing to the next step.
    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    // Optionally, you might want a function to close the drawer when finished.
    const handlePlaceOrder = () => {
        // Place order logic here...
    };

    return (
        <>
            <Accordion variant="splitted"
                       className={'w-full px-0 gap-4'}
                       selectedKeys={[String(currentStep)]}
                       defaultExpandedKeys={expandedKeys}
                       disabledKeys={disabledKeys}
            >
                <AccordionItem
                    key="1"
                    aria-label="Sign in or sign up to place order"
                    title="1. Sign in or sign up to place order"
                    className={'shadow-none border-1'}
                    indicator={1 < currentStep && <Icon icon={'solar:check-read-linear'} width={24}/>}
                >
                    <div className={'my-8'}>
                        <TwoStepAuthForm
                            setIsLogin={handleLogin}
                        />
                    </div>
                </AccordionItem>
                <AccordionItem
                    key="2"
                    className={'shadow-none border-1'}
                    aria-label="Pick Up Details"
                    title="2. Pick Up Details"
                    indicator={2 < currentStep && <Icon icon={'solar:check-read-linear'} width={24}/>}
                >
                    <ScheduleOrder
                        dateParam={date}
                        timeParam={time}
                        handleNext={handleNext}
                    />
                </AccordionItem>

                <AccordionItem
                    key="3"
                    className={'shadow-none border-1'}
                    aria-label="Cart Details"
                    title="3. Cart Details"
                    indicator={3 < currentStep && <Icon icon={'solar:check-read-linear'} width={24}/>}
                >
                    <CartCheckout
                        handleNext={handleNext}
                    />
                </AccordionItem>

                <AccordionItem key="4" className={'shadow-none border-1'} aria-label="Payment Details" title="4. Payment Details"
                               indicator={<Icon icon={'solar:wallet-money-broken'}  width={24}/>}
                               disableIndicatorAnimation
                >
                    {"Send user to Stripe -> Get Verification from stripe -> Place Order || Choose Payment Method -> Place Order"}
                </AccordionItem>

            </Accordion>
            <Spacer y={8}/>
            <Button
                radius={'full'}
                className={'w-full'}
            >
                Place Order
            </Button>
        </>
    );
}
