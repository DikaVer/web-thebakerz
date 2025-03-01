// app/api/validate-session/route.ts
import { NextResponse } from 'next/server';
import {getStoreDataByStoreNameOrId} from "@/lib/actions/store";

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
        const storeData = await getStoreDataByStoreNameOrId(id);
        return NextResponse.json(storeData, { status: 200 });
    } catch (error) {
        console.error('Error validating session:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
