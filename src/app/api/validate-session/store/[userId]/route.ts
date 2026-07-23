/**
 * @fileoverview API route handling GET /api/validate-session/store/[userId], which lists a user's stores with new-order counts.
 *
 * Queries PostgreSQL for all stores owned by the given user and augments each with its
 * count of new orders via getNewOrderCount. Requires bearer token authentication and
 * returns the store list as JSON.
 */
import { getNewOrderCount } from "@/lib/actions/order";
import { connectionPool } from "@/db";
import { checkBearerToken } from "@/lib/utils/helper/bearerChecker";
import { NextResponse } from "next/server";


export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;

    const authError = await checkBearerToken(request);
    if (authError) {
        return authError;
    }

    const stores = await connectionPool.query(
        `
            SELECT 
              id, nickname as name
            FROM stores
            WHERE user_id = $1
            `,
        [userId]
    );

    // Extract store IDs and names from the query result
    const storeData = await Promise.all(
        stores.rows.map(async (row: { id: string, name: string }) => {
            // Get new orders count for each store
            const orders = await getNewOrderCount(row.id);

            return {
                id: row.id,
                name: row.name,
                newOrdersCount: orders
            };
        })
    );

    return NextResponse.json({ stores: storeData }, { status: 200 });
}