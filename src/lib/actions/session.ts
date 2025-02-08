import 'server-only';
import {
    encodeBase32LowerCaseNoPadding,
    encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { cookies } from "next/headers";
import { cache } from "react";

import type { User } from "./user";
import {connectionPool} from "@/db";

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
      users.role
    FROM sessions
    INNER JOIN users ON sessions.user_id = users.id
    WHERE sessions.session_token = $1
    `,
        [sessionId]
    );

    // If no matching session is found, return null for both session and user.
    if (result.rows.length === 0) {
        return { session: null, user: null };
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
        role: row.role
    };

    // If the session has expired, delete it from the database and return null.
    if (Date.now() >= session.expiresAt.getTime()) {
        await connectionPool.query(
            `DELETE FROM sessions WHERE id = $1`,
            [session.id]
        );
        return { session: null, user: null };
    }

    // If the session is nearing expiry (within 15 days), extend it by 30 days from now.
    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
        session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
        await connectionPool.query(
            `UPDATE sessions SET expires_at = $1 WHERE id = $2`,
            [session.expiresAt.getTime(), session.id]
        );
    }

    return { session, user };
}

// Wrap getCurrentSession with React's cache. Note that since cookies() is now async,
// we mark the callback as async and return a Promise.
export const getCurrentSession = cache(async (): Promise<SessionValidationResult> => {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value ?? null;
    if (token === null) {
        return { session: null, user: null };
    }
    return await validateSessionToken(token);
});

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

export function generateSessionToken(): string {
    const tokenBytes = new Uint8Array(20);
    crypto.getRandomValues(tokenBytes);
    const token = encodeBase32LowerCaseNoPadding(tokenBytes).toLowerCase();
    return token;
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

type SessionValidationResult =
    | { session: Session; user: User }
    | { session: null; user: null };
