import { NextResponse } from 'next/server';
import { containerOrders } from "@/db";
import { getTranslations } from "next-intl/server";
import { globalGETRateLimit } from '@/lib/actions/requests';
/**
 * API Route: GET User Orders
 *
 * Retrieves all orders for a specific user by email.
 * Requires authentication via bearer token.
 *
 * Required headers:
 * - Email: User email
 * - Authorization: Bearer token
 *
 * @route GET /api/user/orders
 * @returns {Promise<NextResponse>} Orders data or error response
 */
export async function GET(request: Request) {
    const t = await getTranslations("app/api/user/orders");

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