import { NextResponse } from 'next/server';
import {stripe} from "@/stripe";


export async function POST(req: Request) {

    const { items, storeStripeId, storeId } = await req.json();

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
            return_url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/${storeId}/checkout`
        });


        return NextResponse.json({clientSecret: session.client_secret}, { status: 200 });
    } catch (error: any) {
        console.error('Error processing order:', error);
        return NextResponse.json({ error: 'Order processing failed.' }, { status: 500 });
    }
}
