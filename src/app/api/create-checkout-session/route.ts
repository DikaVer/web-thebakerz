
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
const stripe = new Stripe('sk_test_Gx4mWEgHtCMr4DYMUIqfIrsz', {
    apiVersion: '2025-01-27.acacia; custom_checkout_beta=v1' as any,
});

export async function POST(req: Request) {

    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'T-shirt',
                        },
                        unit_amount: 2000,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            ui_mode: 'custom',
            // The URL of your payment completion page
            return_url: 'http://localhost:3000/dikaver_whites/checkout'
        });



        return NextResponse.json({clientSecret: session.client_secret}, { status: 200 });
    } catch (error: any) {
        console.error('Error processing order:', error);
        return NextResponse.json({ error: 'Order processing failed.' }, { status: 500 });
    }
}
