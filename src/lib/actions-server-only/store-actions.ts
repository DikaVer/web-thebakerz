import 'server-only';
import {sql} from "@vercel/postgres";
import {StoreData} from "@/lib/definitions";

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

export const fetchStoreId = async (storeId: string): Promise<{ storeId: string, nickname: string, image: string } | null> => {
    try {
        if (!storeId){
            return null;
        }
        const lowerCaseStoreId = storeId.toLowerCase();

        const queryStore = await sql`
        SELECT 
            s.id as store_id, s.nickname,
            u.image as user_image
        FROM 
            stores s
        LEFT JOIN 
            users u ON u.id = s.user_id
        WHERE 
            (s.id = ${`${storeId}`} OR s.nickname = ${`${lowerCaseStoreId}`}) AND s.deleted = FALSE
`;

        if (!queryStore.rows[0]) {
            return null;
        }

        return {
            storeId: queryStore.rows[0].store_id,
            nickname: queryStore.rows[0].nickname,
            image: queryStore.rows[0].user_image
        }
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch store id.');
    }
}



export const fetchStoreData = async (storeId: string): Promise<StoreData | null> => {

    try {
        const lowerCaseStoreId = storeId.toLowerCase();

        const queryStoreId = await sql`SELECT id FROM stores WHERE (id = ${storeId} OR nickname = ${lowerCaseStoreId}) AND deleted = FALSE`;

        if (!queryStoreId.rows || queryStoreId.rows.length === 0) {
            return null;
        }

        const originalStoreId = queryStoreId.rows[0].id;



        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/getAll`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NEXT_PRIVATE_API_SECRET_KEY}`
            },
            body: JSON.stringify({
                storeId: originalStoreId
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Error creating store ", result);
            return null;
        }

        return {
            id: result.storeData.store_id,
            user_id: result.storeData.user_id,
            name: result.storeData.user_name,
            description: result.storeData.description,
            location: {
                city: result.storeData.city,
                country: result.storeData.country,
                latitude: result.storeData.latitude,
                longitude: result.storeData.longitude,
                premise: result.storeData.premise,
                route: result.storeData.route,
                state: result.storeData.state,
                street_number: result.storeData.street_number,
                sub_premise: result.storeData.sub_premise,
                zip_code: result.storeData.zip_code,
            },
            image: result.storeData.user_image,
            background_url: result.storeData.background_url,
            nickname: result.storeData.nickname,
            products: result.products,
            availability: result.availability,
            deliveryOptions: result.deliveryOptions
        }

    } catch (error) {
        console.error("Error creating store", error);
        return null;
    }

};
