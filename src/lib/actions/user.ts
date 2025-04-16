'use server';
import {connectionPool} from "@/db";
import {acceptTOS} from "@/lib/term-of-service";
import {TOS_VERSION} from "@/lib/local-variables";
import {revalidateTag} from "next/cache";
import { StoreBusinessData } from "./store";

export async function createUser(email: string): Promise<User> {
    try {
        const normalizedEmail = email.toLowerCase();
        const emailSplit = normalizedEmail.split("@")
        const username = emailSplit[0]
        const result = await connectionPool.query(
            `INSERT INTO users (email, name) VALUES ($1, $2) RETURNING id`,
            [normalizedEmail, username]
        );

        if (result.rows.length === 0) {
            throw new Error("Unexpected error");
        }

        const row = result.rows[0];
        const user: User = {
            id: row.id,
            username,
            email: normalizedEmail,
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
        const normalizedEmail = email.toLowerCase();
        const result = await connectionPool.query(
            `
      INSERT INTO users (google_id, email, name, image, email_verified)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, role, email_verified
      `,
            [googleId, normalizedEmail, name, picture]
        );

        if (result.rows.length === 0) {
            throw new Error("Unexpected error");
        }

        const row = result.rows[0];

        const user: User = {
            id: row.id, // id is returned as a string
            googleId,
            email: normalizedEmail,
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
        const normalizedEmail = email.toLowerCase();
        await connectionPool.query(
            `
      UPDATE users
      SET email = $1, email_verified = NOW()
      WHERE id = $2
      `,
            [normalizedEmail, userId]
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
        const normalizedEmail = email.toLowerCase();
        const result = await connectionPool.query(
            `
      UPDATE users
      SET email_verified = NOW()
      WHERE id = $1 AND email = $2
      `,
            [userId, normalizedEmail]
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
        const normalizedEmail = email.toLowerCase();
        const result = await connectionPool.query(
            `
      SELECT id, email, name AS username, email_verified, role
      FROM users
      WHERE email = $1
      `,
            [normalizedEmail]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];

        const user: User = {
            id: row.id,
            email: normalizedEmail,
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

export async function isStoreNicknameExist(nickname: string, userId: string): Promise<Boolean> {
    try {
        const result = await connectionPool.query(
            `
      SELECT 
        id
      FROM stores
      WHERE nickname = $1 AND user_id != $2
      `,
            [nickname, userId]
        );

        if (result.rows.length === 0) {
            return false;
        } else {
            return true;
        }

    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to get user by email.');
    }
}

export async function creatAccountAction(email: string, bearer: string): Promise<User | null> {
    if (!email) {
        return null;
    }
    if (!bearer) {
        return null;
    }
    if (bearer !== process.env.NEXT_PRIVATE_SECRET_BEARER) {
        return null;
    }

    let user: User | null = await getUserFromEmail(email as string);
    if (user === null) {
        user = await createUser(email as string);
    }

    // const sessionToken =  generateSessionToken();
    // const session = await createSession(sessionToken, user.id);
    //
    // await setSessionTokenCookie(sessionToken, session.expiresAt);
    await acceptTOS(user.email, TOS_VERSION, "payment", "explicit", "payment");
    revalidateTag('session');
    return user;
}

export const getCurrentBusinessUser = async (id: string): Promise<StoreBusinessData | null> => {
    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/business`, {
        headers: {
            'User-Id': id,
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
        },
        next: {
            tags: ['store'],
            revalidate: 300
        }
    }).then(res => res.json());
};


export interface User {
    id: string;
    googleId?: string;
    email: string;
    username: string;
    emailVerified: boolean;
    role: string;
    picture?: string;
}
