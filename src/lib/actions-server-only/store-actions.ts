import 'server-only';
import {sql} from "@vercel/postgres";

export const config = {
    runtime: 'edge', // 'nodejs' is the default
};



const ITEMS_PER_PAGE = 6;
export async function fetchStoresPages(query: string) {
    try {
        const count = await sql`SELECT COUNT(*)
    FROM stores WHERE
        stores.nickname ILIKE ${`%${query}%`} OR
        stores.user_id ILIKE ${`%${query}%`} 
  `;
        return Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch total number of stores.');
    }
}

export type StoresTable = {
    id: string;
    nickname: string;
    user_id: string;
    date: Date;
};

export async function fetchFilteredStores(
    query: string,
    currentPage: number,
) {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    try {
        const stores = await sql<StoresTable>`
      SELECT
            stores.id,
            stores.nickname,
            stores.user_id,
            stores.date
      FROM stores
      WHERE
         stores.nickname ILIKE ${`%${query}%`} OR
         stores.user_id ILIKE ${`%${query}%`} 
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

        return stores.rows;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch users.');
    }
}



export const fetchStoreData = async (storeId: string) => {

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/getAll`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NEXT_PRIVATE_API_SECRET_KEY}`
            },
            body: JSON.stringify({
                storeId: storeId
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                error: result.message,
            }
        }

        return {
            store: result.store,
            user: result.user,
            location: result.location,
            products: result.products,
            availability: result.availability,
            deliveryOptions: result.delivery,
            success: 'Store data fetched successfully',
        }

    } catch (error) {
        console.error("Error creating store", error);
        return {
            error: "Something went wrong. Please try again later.",
        };
    }

};
