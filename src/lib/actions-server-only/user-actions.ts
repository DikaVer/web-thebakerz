import 'server-only';
import {sql} from "@vercel/postgres";
import {UsersData} from "@/lib/definitions";

export const config = {
    runtime: 'edge', // 'nodejs' is the default
};



const ITEMS_PER_PAGE = 6;
export async function fetchUsersPages(query: string) {
    try {
        const count = await sql`SELECT COUNT(*)
    FROM users WHERE
        users.name ILIKE ${`%${query}%`} OR
        users.email ILIKE ${`%${query}%`}
  `;
        return Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch total number of invoices.');
    }
}


export async function fetchFilteredUsers(
    query: string,
    currentPage: number,
) {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    try {
        const users = await sql<UsersData>`
      SELECT
        users.id,
        users.name, 
        users.email,
        users.image,
        users.role
      FROM users
       WHERE
        users.name ILIKE ${`%${query}%`} OR
        users.email ILIKE ${`%${query}%`} 
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

        return users.rows;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch users.');
    }
}

export async function fetchFilteredUsersDefault(
    query: string,
    currentPage: number,
) {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    try {
        const users = await sql<UsersData>`
      SELECT
        users.id,
        users.name, 
        users.email,
        users.image,
        users.role
      FROM users
       WHERE
        (users.name ILIKE ${`%${query}%`} OR
        users.email ILIKE ${`%${query}%`}) AND
        users.role = 'user'
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

        return users.rows;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch users.');
    }
}

export async function fetchUserData(
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
        users.date
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
