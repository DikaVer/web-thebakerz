// components/PaymentForm.tsx
'use client';
import React from 'react';
import {PaymentElement, useCheckout} from '@stripe/react-stripe-js';
import PayButton from "@/components/checkout/payment/pay-button";
import {IconLoadingCircle} from "@/components/ui/icons";



const PaymentForm = () => {
    const checkout = useCheckout();
    console.log(checkout);
    return (
        <form>
            <PaymentElement options={{layout: 'accordion'}}/>
            {/*<PayButton/>*/}
        </form>
    );
};

export default PaymentForm;
