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

export type UsersData = {
    id: string;
    name: string;
    email: string;
    image: string;
    role: string;
    userToken: string;
};

export async function fetchStoreData(
    query: string
) : Promise<UsersData> {

    try {
        const users = await sql<UsersData>`
      SELECT
        users.id,
        users.name, 
        users.email,
        users.image,
        users.role,
        users."userToken"
      FROM users
       WHERE
        users.id = ${`${query}`}
    `;

        return users.rows[0];
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch users.');
    }
}
