'use server'

import { headers } from 'next/headers'

import {stripe} from "@/stripe";

export async function fetchClientSecret() {
    const origin = (await headers()).get('origin')

    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
        ui_mode: 'embedded',
        submit_type: 'pay',
        billing_address_collection: 'auto',
        line_items: [
            {
                // Provide the exact Price ID (for example, pr_1234) of
                // the product you want to sell
                price: 'price_1QyLNR4fjZXKNzErb01C0H3A',
                quantity: 1
            }
        ],
        mode: 'payment',
        return_url: `${origin}/return?session_id={CHECKOUT_SESSION_ID}`,
        automatic_tax: {enabled: false},
    })

    return session.client_secret
}