// src/app/api/store/orders/range/route.ts
import { NextResponse } from 'next/server';
import { containerOrders } from "@/db";

export async function GET(request: Request) {
    // Retrieve headers
    const storeId = request.headers.get('Store-Id');
    if (!storeId) {
        return NextResponse.json(
            { error: 'Missing Store-Id header' },
            { status: 400 }
        );
    }

    const fromDate = request.headers.get('From-Date');
    if (!fromDate) {
        return NextResponse.json(
            { error: 'Missing From-Date header' },
            { status: 400 }
        );
    }

    const toDate = request.headers.get('To-Date');
    if (!toDate) {
        return NextResponse.json(
            { error: 'Missing To-Date header' },
            { status: 400 }
        );
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json(
            { error: 'Missing Authorization header' },
            { status: 401 }
        );
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (token !== process.env.NEXT_PRIVATE_SECRET_BEARER) {
        return NextResponse.json(
            { error: 'Not Authorized Access' },
            { status: 401 }
        );
    }

    try {

        // Format dates to match the format in the database (YYYY-M-D)
        const fromDateObj = new Date(fromDate);

        const toDateObj = new Date(toDate);


        const fromDateString = `${fromDateObj.getFullYear()}-${fromDateObj.getMonth() + 1}-${fromDateObj.getDate()}`;
        const toDateString = `${toDateObj.getFullYear()}-${toDateObj.getMonth() + 1}-${toDateObj.getDate()}`;

        // Query using the UDF
        const querySpec = {
            query: `
                SELECT * FROM c
                WHERE c.store_id = @storeId
                  AND udf.compareDateStrings(c.scheduled_time.date, @fromDate) = true
                  AND udf.compareDateStrings(@toDate, c.scheduled_time.date) = true
            `,
            parameters: [
                { name: "@storeId", value: storeId },
                { name: "@fromDate", value: fromDateString },
                { name: "@toDate", value: toDateString }
            ]
        };

        const { resources: orders } = await containerOrders.items.query(querySpec).fetchAll();


        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching orders by date range:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}