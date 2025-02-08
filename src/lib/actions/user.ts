import {connectionPool} from "@/db";

export async function createUser(email: string): Promise<User> {
    try {
        const emailSplit = email.split("@")
        const username = emailSplit[0]

        const result = await connectionPool.query(
            `INSERT INTO users (email, name) VALUES ($1, $2) RETURNING id`,
            [email, username]
        );

        if (result.rows.length === 0) {
            throw new Error("Unexpected error");
        }

        const row = result.rows[0];
        const user: User = {
            id: row.id,
            username,
            email,
            emailVerified: false,
            role: row.role
        };

        return user;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to create user.');
    }
}

export async function createUserGoogle(
    googleId: string,
    email: string,
    name: string,
    picture: string
): Promise<User> {
    try {
        const result = await connectionPool.query(
            `
      INSERT INTO users (google_id, email, name, image, email_verified)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, role, email_verified
      `,
            [googleId, email, name, picture]
        );

        if (result.rows.length === 0) {
            throw new Error("Unexpected error");
        }

        const row = result.rows[0];

        const user: User = {
            id: row.id, // id is returned as a string
            googleId,
            email,
            username: name,
            picture,
            role: row.role,
            emailVerified: row.email_verified !== null
        };

        return user;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to create user");
    }
}

export async function getUserFromGoogleId(googleId: string): Promise<User | null> {
    try {
        const result = await connectionPool.query(
            `
      SELECT id, google_id, email, name, image AS picture, role
      FROM users
      WHERE google_id = $1
      `,
            [googleId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];

        const user: User = {
            id: row.id,
            googleId: row.google_id,
            email: row.email,
            username: row.name,
            picture: row.picture,
            role: row.role,
            emailVerified: row.email_verified !== null
        };

        return user;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to get user by Google ID");
    }
}


export async function updateUserEmailAndSetEmailAsVerified(
    userId: string,
    email: string
): Promise<void> {
    try {
        await connectionPool.query(
            `
      UPDATE users
      SET email = $1, email_verified = NOW()
      WHERE id = $2
      `,
            [email, userId]
        );
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to update user email and verify email.');
    }
}

/**
 * Sets the user's email as verified (by setting "emailVerified" to NOW())
 * only if the provided email matches the one in the database.
 * Returns true if a row was updated, false otherwise.
 */
export async function setUserAsEmailVerifiedIfEmailMatches(
    userId: string,
    email: string
): Promise<boolean> {
    try {
        const result = await connectionPool.query(
            `
      UPDATE users
      SET "emailVerified" = NOW()
      WHERE id = $1 AND email = $2
      `,
            [userId, email]
        );
        return result.rowCount > 0;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to set user as email verified.');
    }
}

/**
 * Retrieves a user by email.
 * Maps the "name" column from the database to the username property.
 * Treats a non-null "emailVerified" timestamp as a verified email.
 */
export async function getUserFromEmail(email: string): Promise<User | null> {
    try {
        const result = await connectionPool.query(
            `
      SELECT id, email, name AS username, email_verified, role
      FROM users
      WHERE email = $1
      `,
            [email]
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

export interface User {
    id: string;
    googleId?: string;
    email: string;
    username: string;
    emailVerified: boolean;
    role: string;
    picture?: string;
}
