/**
 * @fileoverview Server-only session management for authentication.
 *
 * Implements token-based sessions stored in the PostgreSQL sessions table:
 * token generation, SHA-256 hashed session IDs, creation, validation with
 * sliding 30-day expiry, and invalidation (single session or all of a
 * user's). Also manages the "session" auth cookie and the anonymous
 * "thebakerz-session" guest cookie, and exports getCurrentSession, which
 * resolves the current user and their stores via the validate-session API
 * with cache tags.
 */
import 'server-only';
import {encodeBase32LowerCaseNoPadding, encodeHexLowerCase,} from "@oslojs/encoding";
import {sha256} from "@oslojs/crypto/sha2";
import {cookies} from "next/headers";
import type {User} from "./user";
import {connectionPool} from "@/db";
import {v4 as uuidv4} from "uuid";

export async function validateSessionToken(
    token: string
): Promise<SessionValidationResult> {
    // Generate the session ID from the token
    const sessionId = encodeHexLowerCase(
        sha256(new TextEncoder().encode(token))
    );

    // Fetch session and user data from the database
    const result = await connectionPool.query(
        `
    SELECT 
      sessions.session_token AS session_id,
      sessions.user_id AS session_user_id,
      sessions.expires_at,
      users.id AS user_id,
      users.email,
      users.name AS username,
      users.email_verified as emailVerified,
      users.image as picture,
      users.role,
      users.birth,
      users.sex,
      users.push_note,
      users.email_note,
      users.phone_note
    FROM sessions
    INNER JOIN users ON sessions.user_id = users.id
    WHERE sessions.session_token = $1
    `,
        [sessionId]
    );

    // If no matching session is found, return null for both session and user.
    if (result.rows.length === 0) {
        return {session: null, user: null, stores: null};
    }

    const row = result.rows[0];

    // Build the session object.
    const session: Session = {
        id: row.session_id,
        userId: row.session_user_id,
        // Convert Unix timestamp (in seconds) to JavaScript Date (milliseconds)
        expiresAt: new Date(row.expires)
    };

    // Build the user object.
    const user: User = {
        id: row.user_id,
        email: row.email,
        username: row.username,
        emailVerified: Boolean(row.emailVerified !== null), // ensure proper casing
        role: row.role,
        picture: row.picture,
        birth: row.birth,
        sex: row.sex,
        push_note: row.push_note,
        email_note: row.email_note,
        phone_note: row.phone_note
    };

    // If the session has expired, delete it from the database and return null.
    if (Date.now() >= session.expiresAt.getTime()) {
        await connectionPool.query(
            `DELETE FROM sessions WHERE id = $1`,
            [session.id]
        );
        return { session: null, user: null, stores: null };
    }

    // If the session is nearing expiry (within 15 days), extend it by 30 days from now.
    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
        session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
        await connectionPool.query(
            `UPDATE sessions SET expires_at = $1 WHERE id = $2`,
            [session.expiresAt, session.id]
        );
    }

    return { session, user, stores: [] };
}


// Wrap getCurrentSession with React's cache. Note that since cookies() is now async,
// we mark the callback as async and return a Promise.
export const getCurrentSession = async (): Promise<SessionValidationResult> => {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value ?? null;

    if (token === null) {
        return { session: null, user: null, stores: null };
    }

    // Call the validate-session API with the bearer token and a revalidation tag.
    const { user, session } = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/validate-session`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        next: {
            tags: ['session'],
            revalidate: 300
        }
    }).then(res => res.json());

    let stores: StoreInfo[] = [];

    if (user) {
        const { stores: storeData } = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/validate-session/store/${user?.id}`, {
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`
            },
            next: {
                tags: ['stores', 'session', 'orders'],
                revalidate: 300
            }
        }).then(res => res.json());

        stores = storeData;
    }

    return { session, user, stores: stores };
};



export async function invalidateSession(sessionId: string): Promise<void> {
    try {
        await connectionPool.query(
            `DELETE FROM sessions WHERE session_token = $1`,
            [sessionId]
        );
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to invalidate session.');
    }
}

export async function invalidateUserSessions(userId: number): Promise<void> {
    try {
        await connectionPool.query(
            `DELETE FROM sessions WHERE user_id = $1`,
            [userId]
        );
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to invalidate user sessions.');
    }
}

// Mark as async so that we can await cookies() before setting a cookie.
export async function setSessionTokenCookie(
    token: string,
    expiresAt: Date
): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
    });
}

// Likewise, deleteSessionTokenCookie must await cookies()
export async function deleteSessionTokenCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set("session", "", {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
    });
}



export async function getSessionCookieOrCreate(): Promise<string> {
    const cookieStore = await cookies();
    let userId = cookieStore.get("thebakerz-session")?.value ?? null;
    if (userId === null) {
        userId = uuidv4();
        cookieStore.set("thebakerz-session", userId, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 1, // 1 days
        });
    }
    return userId;
}
export async function getSessionCookie(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get("thebakerz-session")?.value ?? null;
}

export function generateSessionToken(): string {
    const tokenBytes = new Uint8Array(20);
    crypto.getRandomValues(tokenBytes);
    return encodeBase32LowerCaseNoPadding(tokenBytes).toLowerCase();
}

// createSession does not use cookies so it can remain synchronous
export async function createSession(
    token: string,
    userId: string
): Promise<Session> {
    const sessionId = encodeHexLowerCase(
        sha256(new TextEncoder().encode(token))
    );

    const session: Session = {
        id: sessionId,
        userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    };

    try {
        await connectionPool.query(
            `INSERT INTO sessions (user_id, expires_at, session_token) VALUES ($1, $2, $3)`,
            [
                session.userId,
                session.expiresAt,
                session.id
            ]
        );
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to create session.');
    }

    return session;
}


export interface Session {
    id: string;
    expiresAt: Date;
    userId: string;
}

export interface StoreInfo {
    id: string;
    name: string;
    newOrdersCount: number;
}

export type SessionValidationResult =
    | { session: Session; user: User; stores: StoreInfo[] }
    | { session: null; user: null; stores: null };
