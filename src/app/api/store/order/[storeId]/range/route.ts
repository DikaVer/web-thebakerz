import { NextResponse } from 'next/server';
import { containerOrders } from "@/db";
import { getTranslations } from "next-intl/server";
import { globalGETRateLimit } from '@/lib/utils/helper/requests';
import { checkBearerToken } from '@/lib/utils/helper/bearerChecker';

export async function GET(request: Request, {params}: {params: Promise<{storeId: string}>}) {
    const t = await getTranslations("app/api/store/orders/range");

    if (!(await globalGETRateLimit())) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429 }
        );
    }

    const {storeId} = await params;
    const fromDate = request.headers.get('From-Date');
    if (!fromDate) {
        return NextResponse.json(
            { error: t("missingFromDate") },
            { status: 400 }
        );
    }

    const toDate = request.headers.get('To-Date');
    if (!toDate) {
        return NextResponse.json(
            { error: t("missingToDate") },
            { status: 400 }
        );
    }

    const authError = await checkBearerToken(request);
     if (authError) {
         return authError;
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
            { error: t("internalError") },
            { status: 500 }
        );
    }
}