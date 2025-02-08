import 'server-only';
import {connectionPool} from "@/db";
import {AddressDataUserField, AddressUserData, UsersData} from "@/lib/definitions";

export const config = "edge";



const ITEMS_PER_PAGE = 10;
export async function fetchUsersPages(query: string) {
    try {
        const count = await connectionPool.query(`
          SELECT COUNT(*)
          FROM users WHERE
            users.name ILIKE '%${query}%' OR
            users.email ILIKE '%${query}%';
        `);
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
        const users = await connectionPool.query(`
          SELECT
            users.id,
            users.name, 
            users.email,
            users.image,
            users.role
          FROM users
          WHERE
            users.name ILIKE '%${query}%' OR
            users.email ILIKE '%${query}%'
          LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}`) as { rows: UsersData[] };


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
        const users = await connectionPool.query(`
          SELECT
            users.id,
            users.name, 
            users.email,
            users.image,
            users.role
          FROM users
          WHERE
            (users.name ILIKE '%${query}%' OR
            users.email ILIKE '%${query}%') AND
            users.role = 'user'
          LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset};
        `);


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
        const users = await connectionPool.query(`
          SELECT
            users.id,
            users.name, 
            users.email,
            users.image,
            users.role,
            users.date
          FROM users
          WHERE
            users.id = '${query}';`);

        return users.rows[0];
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch users.');
    }
}

export async function fetchUserLocation(
    query: string
) : Promise<AddressDataUserField[]> {

    try {
        const location = await connectionPool.query(`
          SELECT
            *
          FROM addresses_users
          WHERE
            addresses_users.user_id = '${query}';
        `);

        return location.rows;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch users.');
    }
}
