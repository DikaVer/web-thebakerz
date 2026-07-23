/**
 * @fileoverview Multi-step checkout accordion for the store checkout page.
 *
 * Orchestrates the four checkout steps (sign in, order scheduling, cart
 * review, and Stripe payment) as accordion items, tracking the current step
 * and unlocking later steps as earlier ones complete. Also merges guest cart
 * and address data after login, surfaces payment errors from the URL, tags the
 * session in Microsoft Clarity, and blocks store owners from checking out in
 * their own store.
 */
'use client';
import { Accordion, AccordionItem} from "@heroui/react";
import { Icon } from "@iconify/react";
import TwoStepAuthForm from "@/components/authentication/two-step-auth-form";
import React, { useEffect, useState } from "react";
import { useSession } from "@/components/providers/session-provider";
import NotFound from "@/app/(error_layout)/not-found";
import { ScheduleOrder } from "@/components/checkout/schedule/schedule-order";
import CartCheckout from "@/components/checkout/schedule/cart-checkout";
import { replaceGuestCart } from "@/lib/actions/cart";
import { useStore } from "@/components/providers/store-provider";
import showErrorMessage from "@/components/toast/toast-error";
import { useTranslations } from "next-intl";
import { replaceGuestAddress } from "@/lib/actions/delivery-actions";
import clarity from "@microsoft/clarity";
import { useDelivery } from "@/components/providers/delivery-provider";
import { useRouter, useSearchParams } from "next/navigation";
import EmbeddedCheckout from "@/components/checkout/payment/embedded-checkout";
import { getErrorMessage } from "@/lib/utils/payment-errors";

export default function CheckoutSteps({ isRescueDeal }: { isRescueDeal: boolean }) {
    const { session } = useSession();
    const t = useTranslations("app/(store)/components/checkout-steps");
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const checkForError = async () => {
        const error = searchParams.get('error');
        if (error) {
            const errorMessage = await getErrorMessage(error);
            showErrorMessage({ error: errorMessage });
            
            // Remove error from search params
            const params = new URLSearchParams(searchParams.toString());
            params.delete('error');
            const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
            window.history.replaceState(null, '', newUrl);
        }
    }
        checkForError();
    }); // Remove searchParams dependency to prevent re-running

    useEffect(() => {
        clarity.upgrade("checkout");
        clarity.setTag("page", "checkout-steps");
    }, []);

    const { store } = useStore();
    const steps = ["1", "2", "3", "4"];
    const { isDelivery, selectedDate, validationResult } = useDelivery();
    const canProceedToPayment = isDelivery 
        ? validationResult.isValid && validationResult.isInRange && selectedDate
        : selectedDate;

    const [totalAmount, setTotalAmount] = useState<number>(0);

    // const initialStep = session?.user 
    //     ? canProceedToPayment ? 3 : 2 
    //     : 2;

    const initialStep = canProceedToPayment ? 3 : 2 
    const finalStep = isRescueDeal ? 3 : initialStep;
    

    const [currentStep, setCurrentStep] = useState<number>(finalStep);
    const disabledKeys = steps.filter((key) => Number(key) > currentStep);
    const [selectedKey, setSelectedKey] = useState<string>(currentStep.toString());
    const storeUrl = store?.storeName ? store?.storeName : store?.id;

    // useEffect(() => {
    //     if (canProceedToPayment) {
    //         router.push(`/${storeUrl}/pay`);
    //     }
    // }, [canProceedToPayment]);

    if (session?.user?.role === "bakerz" && session?.user?.id === store.user_id) {
        return NotFound();
    }

    const handleLogin = async (value: boolean) => {
        const result = await replaceGuestCart(store.id);
        const result_address = await replaceGuestAddress();
        if (result.success && result_address.success) {
            handleNext(2);
        } else {
            showErrorMessage({ error: t("failedToUpdateCart") });
        }
    };

    const handleNext = (key: number) => {
        if (currentStep < steps.length) {
            const nextStep = key > currentStep ? key : currentStep;
            setCurrentStep(nextStep);
            setSelectedKey(nextStep.toString());
        }
    };

    return (
        <>
            <Accordion
                variant="splitted"
                className={'w-full px-0 gap-4'}
                selectionMode={'single'}
                selectedKeys={selectedKey}
                disabledKeys={disabledKeys}
            >
                <AccordionItem
                    key="1"
                    aria-label={t("signInOrSignUpText")}
                    title={t("signInOrSignUpStep")}
                    className={'shadow-none border-1'}
                    disableIndicatorAnimation
                    isDisabled={!!session?.user}
                    indicator={
                        1 < currentStep
                            ? <Icon icon={'solar:check-read-linear'} width={24} />
                            : <Icon icon={"solar:login-3-broken"} className={'text-default-400'} width={24} />
                    }
                    onPress={() => {
                        !session?.user && setSelectedKey("1");
                        if (currentStep > 3) {
                            setCurrentStep(3);
                        }
                    }}
                >
                    <div className={'my-8'}>
                        <TwoStepAuthForm
                            storeId={store.id}
                            setIsLogin={handleLogin}
                            handleNext={() => {
                                clarity.setTag("step", "login");
                                handleNext(2)
                            }}
                        />
                    </div>
                </AccordionItem>
                <AccordionItem
                    key="2"
                    className={'shadow-none border-1'}
                    aria-label={t("orderDetails")}
                    title={t("orderDetailsStep")}
                    disableIndicatorAnimation
                    indicator={
                        2 < currentStep
                            ? <Icon icon={'solar:check-read-linear'} width={24} />
                            : <Icon icon={"solar:clock-circle-broken"} className={'text-default-400'} width={24} />
                    }
                    onPress={() => {
                        setSelectedKey("2");
                        if (currentStep > 3) {
                            setCurrentStep(3);
                        }
                    }}
                >
                    <ScheduleOrder
                        handleNext={() => {
                            clarity.setTag("step", "order-details");
                            handleNext(3)
                        }}
                    />
                </AccordionItem>
                <AccordionItem
                    key="3"
                    className={'shadow-none border-1'}
                    aria-label={t("cartDetails")}
                    title={t("cartDetailsStep")}
                    disableIndicatorAnimation
                    indicator={
                        3 < currentStep
                            ? <Icon icon={'solar:check-read-linear'} width={24} />
                            : <Icon icon={"solar:cart-large-minimalistic-broken"} className={'text-default-400'} width={24} />
                    }
                    onPress={() => {
                        setSelectedKey("3");
                        if (currentStep > 3) {
                            setCurrentStep(3);
                        }
                    }}
                >
                    <CartCheckout 
                        setTotalAmount={setTotalAmount}
                        handleNext={() => {
                            clarity.setTag("step", "cart-details");
                            handleNext(4);
                        }}
                    />
                </AccordionItem>
                <AccordionItem
                    key="4"
                    className={'shadow-none border-1'}
                    aria-label={t("paymentDetails")}
                    title={t("paymentDetailsStep")}
                    disableIndicatorAnimation
                    indicator={
                        4 < currentStep
                            ? <Icon icon={'solar:check-read-linear'} width={24} />
                            : <Icon icon={"material-symbols:payments-outline"} className={'text-default-400'} width={24} />
                    }
                    onPress={() => {
                        setSelectedKey("4");
                        if (currentStep > 4) {
                            setCurrentStep(4);
                        }
                    }}
                >
                    <EmbeddedCheckout
                        totalAmount={totalAmount}
                        isZeroCommission={store.stripe_zero_commission || false}
                        storeStripeAccountId={store.stripe_id!}
                        onPaymentSuccess={() => {
                            clarity.setTag("step", "pay");
                            handleNext(5);
                            setCurrentStep(0);
                        }}
                        onPaymentError={() => {
                            setSelectedKey("3");
                            if (currentStep > 3) {
                                setCurrentStep(3);
                            }
                            router.refresh();
                        }}
                        isRescueDeal={isRescueDeal}
                    />
                </AccordionItem>
            </Accordion>
        </>
    );
}