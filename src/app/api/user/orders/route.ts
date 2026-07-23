/**
 * @fileoverview API route handling GET /api/user/orders, which lists all orders for a customer.
 *
 * Reads the customer email from the Email request header and queries the Cosmos DB orders
 * container for all orders matching that email, newest first. Requires a bearer token
 * matching NEXT_PRIVATE_SECRET_BEARER in the Authorization header and is rate limited via
 * globalGETRateLimit.
 */
import { NextResponse } from 'next/server';
import { containerOrders } from "@/db";
import { globalGETRateLimit } from '@/lib/utils/helper/requests';
export async function GET(request: Request) {

    if (!(await globalGETRateLimit())) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429 }
        );
    }
    
    // Validate required headers
    const headers = {
        email: request.headers.get('Email'),
        auth: request.headers.get('Authorization')
    };

    // Check for missing headers
    for (const [key, value] of Object.entries(headers)) {
        if (!value) {
            const headerName = key === 'auth' ? 'Authorization' : 'Email';
            return NextResponse.json(
                { error: `Missing ${headerName} header` },
                { status: 401 }
            );
        }
    }

    if (!headers.email) {
        return NextResponse.json(
            { error: "Missing Email header" },
            { status: 401 }
        );
    }

    // Validate bearer token
    // @ts-ignore
    const token = headers.auth.replace('Bearer ', '').trim();
    if (token !== process.env.NEXT_PRIVATE_SECRET_BEARER) {
        return NextResponse.json(
            { error: "Not authorized" },
            { status: 401 }
        );
    }

    try {
        // Query to get all orders for the user email
        const querySpec = {
            query: "SELECT * FROM c WHERE c.customer_email = @email ORDER BY c.createdAt DESC",
            parameters: [
                { name: "@email", value: headers.email.toLowerCase() }
            ]
        };

        const { resources: orders } = await containerOrders.items.query(querySpec).fetchAll();

        return NextResponse.json(orders, { status: 200 });
    } catch (error) {
        console.error('Error retrieving user orders:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 