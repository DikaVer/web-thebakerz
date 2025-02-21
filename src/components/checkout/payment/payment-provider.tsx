// components/PaymentForm.tsx
'use client';

import React from 'react';
import {CheckoutProvider} from '@stripe/react-stripe-js';

import {loadStripe} from "@stripe/stripe-js";
import PaymentForm from "@/components/checkout/payment/payment-form";
const stripePromise = loadStripe("pk_test_VOOyyYjgzqdm8I3SrBqmh9qY", {
    betas: ['custom_checkout_beta_5'],
});

export const CheckoutProviderStripe = () => {

    const [clientSecret, setClientSecret] = React.useState(null);

    React.useEffect(() => {
        fetch('/api/create-checkout-session', {method: 'POST'})
            .then((response) => response.json())
            .then((json) => setClientSecret(json.clientSecret))
    }, []);
    


    if (clientSecret) {
        return (
            <CheckoutProvider
                stripe={stripePromise}
                options={{clientSecret}}
            >
                <PaymentForm/>
            </CheckoutProvider>
        );
    } else {
        return null;
    }
};

