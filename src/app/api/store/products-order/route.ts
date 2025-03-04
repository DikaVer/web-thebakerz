import { NextResponse } from 'next/server';
import {getProductsByStoreId} from "@/lib/actions/product";
import {getProductsOrder} from "@/lib/actions/order-products";

// This API route accepts GET requests with a Bearer token in the Authorization header.
export async function GET(request: Request) {
    // Retrieve the Authorization header
    const id = request.headers.get('Store-Id');
    if (!id) {
        return NextResponse.json(
            { error: 'Missing or invalid Store-Id header' },
            { status: 401 }
        );
    }


    try {
        // Call your validation logic with the extracted token
        const productsOrder = await getProductsOrder(id)
        return NextResponse.json(productsOrder, { status: 200 });
    } catch (error) {
        console.error('Error validating session:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
