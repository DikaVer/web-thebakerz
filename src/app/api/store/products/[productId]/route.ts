import { NextResponse } from 'next/server';
import {getProductByStoreIdAndProductId, getProductsByStoreId} from "@/lib/actions/product";

// This API route accepts GET requests with a Bearer token in the Authorization header.
export async function GET(
    request: Request,
    { params }: { params: Promise<{ productId: string;}> }
) {

    const { productId } = await params;

    // Retrieve the Authorization header
    const id = request.headers.get('Store-Id');
    if (!id) {
        return NextResponse.json(
            { error: 'Missing or invalid Store-Id header' },
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
        // Call your validation logic with the extracted token
        const productData = await getProductByStoreIdAndProductId(id, productId);
        return NextResponse.json(productData, { status: 200 });
    } catch (error) {
        console.error('Error validating session:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}