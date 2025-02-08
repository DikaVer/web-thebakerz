import { generateRandomOTP} from "@/lib/utils";

import { encodeBase32 } from "@oslojs/encoding";
import {connectionPool} from "@/db";
import {sendMagicCode} from "@/lib/authSendRequest";
import {ExpiringTokenBucket} from "@/lib/actions/rate-limits";

export async function getUserEmailVerificationRequest(
    userId: string,
    id: string
): Promise<EmailVerificationRequest | null> {
    try {
        const result = await connectionPool.query(
            `
      SELECT id, user_id, code, email, expires_at 
      FROM email_verification_request 
      WHERE id = $1 AND user_id = $2
      `,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];

        const request: EmailVerificationRequest = {
            id: row.id,
            userId: row.user_id,
            code: row.code,
            email: row.email,
            expiresAt: new Date(row.expires_at)
        };

        return request;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch email verification request.');
    }
}

export async function createEmailVerificationRequest(
    userId: string,
    email: string
): Promise<EmailVerificationRequest> {
    // Delete any previous email verification requests for the user.
    await deleteUserEmailVerificationRequest(userId);

    // Generate a random ID for the verification request.
    const idBytes = new Uint8Array(20);
    crypto.getRandomValues(idBytes);
    const id = encodeBase32(idBytes).toLowerCase();

    const code = generateRandomOTP();
    // Set the expiration to 10 minutes from now.
    const expiresAt = new Date(Date.now() + 1000 * 60 * 10);

    // Insert the email verification request into the database.
    await connectionPool.query(
        `
    INSERT INTO email_verification_request (id, user_id, code, email, expires_at)
    VALUES ($1, $2, $3, $4, $5)
    `,
        [id, userId, code, email, expiresAt]
    );

    const request: EmailVerificationRequest = {
        id,
        userId,
        code,
        email,
        expiresAt,
    };

    return request;
}

export async function deleteUserEmailVerificationRequest(userId: string): Promise<void> {
    try {
        await connectionPool.query(
            `DELETE FROM email_verification_request WHERE user_id = $1`,
            [userId]
        );
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to delete email verification request.');
    }
}

export async function sendVerificationEmail(email: string, code: string): Promise<void> {
    await sendMagicCode({identifier: email, code: code});
}

export const sendVerificationEmailBucket = new ExpiringTokenBucket<string>(3, 60 * 10);

export interface EmailVerificationRequest {
    id: string;
    userId: string;
    code: string;
    email: string;
    expiresAt: Date;
}
