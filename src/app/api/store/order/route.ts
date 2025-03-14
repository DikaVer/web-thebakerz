import { NextResponse } from 'next/server';
import {getOrder} from "@/lib/actions/order";

// This API route accepts GET requests with a Bearer token in the Authorization header.
export async function GET(request: Request) {
    // Retrieve the Authorization header
    const storeId = request.headers.get('Store-Id');
    if (!storeId) {
        return NextResponse.json(
            { error: 'Missing or invalid Store-Id header' },
            { status: 401 }
        );
    }

    const orderId = request.headers.get('Order-Id');
    if (!orderId) {
        return NextResponse.json(
            { error: 'Missing or invalid Order-Id header' },
            { status: 401 }
        );
    }

    const email = request.headers.get('Email');
    if (!email) {
        return NextResponse.json(
            { error: 'Missing or invalid User-Id header' },
            { status: 401 }
        );
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json(
            { error: 'Missing or invalid Authorization header' },
            { status: 401 }
        );
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (token !== process.env.NEXT_PRIVATE_SECRET_BEARER) {
        return NextResponse.json(
            { error: 'Not Authorize Access' },
            { status: 401 }
        );
    }


    try {

        const orderData = await getOrder(storeId, orderId, email);

        return NextResponse.json(orderData, {status: 200 });
    } catch (error) {
        console.error('Error validating session:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
