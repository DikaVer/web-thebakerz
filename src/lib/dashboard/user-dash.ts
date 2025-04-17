'use server';
import { connectionPool } from "@/db";
import {User} from "@/lib/actions/user";

/**
 * Searches users by email (partial match) with pagination.
 *
 * @param email - The email search string.
 * @param cursor - Current offset (defaults to 0).
 * @param limit - Maximum number of users per page.
 * @returns An object containing the users array and nextCursor (null if there are no more pages).
 */
export async function searchUsersByEmailPaginated(
    email: string,
    cursor?: string,
    limit: number = 10
): Promise<{ users: User[]; nextCursor?: string }> {
    try {

        // Use ILIKE for case-insensitive matching
        const query = `
      SELECT id, email, name AS username, email_verified, role
      FROM users
      WHERE email ILIKE $1
      ORDER BY id ASC
      LIMIT $2 OFFSET $3
    `;
        const values = [`%${email}%`, limit, cursor];
        const result = await connectionPool.query(query, values);

        // Map each row to the User interface
        const users: User[] = result.rows.map((row: any) => ({
            id: row.id,
            email: row.email,
            username: row.username,
            emailVerified: row.email_verified !== null,
            role: row.role,
        }));

        // If fewer rows than the limit were returned, no further page exists.
        const nextCursor = result.rows.length < limit || !cursor ? undefined : cursor + limit;
        return { users, nextCursor };
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to search users by email.");
    }
}

/**
 * Retrieves a user by id.
 * Maps the "name" column from the database to the username property.
 */
export async function getUserFromId(id: string): Promise<User | null> {
    try {
        const result = await connectionPool.query(
            `
      SELECT id, email, name AS username, email_verified, role
      FROM users
      WHERE id = $1
      `,
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];

        const user: User = {
            id: row.id,
            email: row.email,
            username: row.username,
            emailVerified: row.email_verified !== null, // if a timestamp exists, the email is verified
            role: row.role,
        };

        return user;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to get user by email.');
    }
}
