import { NextResponse } from 'next/server';
import {getCart} from "@/lib/actions/cart";

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

    const userId = request.headers.get('User-Id');
    if (!userId) {
        return NextResponse.json(
            { error: 'Missing or invalid User-Id header' },
            { status: 401 }
        );
    }


    try {
        // Call your validation logic with the extracted token
        const cartData = await getCart(userId, storeId);

        return NextResponse.json(cartData, { status: 200 });
    } catch (error) {
        console.error('Error validating session:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
