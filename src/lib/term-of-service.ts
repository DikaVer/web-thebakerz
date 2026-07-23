/**
 * @fileoverview Persistence helper for recording Terms of Service acceptance.
 *
 * Exports acceptTOS, which upserts a row in the tos_acceptance PostgreSQL table
 * keyed by email and location, storing the accepted TOS version, IP address,
 * acceptance method (implicit or explicit), and acceptance timestamp.
 */
import { connectionPool } from '@/db';

/**
 * Inserts or updates a record in the tos_acceptance table.
 *
 * If a record already exists for the given email and location, this will update its tos_version,
 * ip_address, acceptance_method, and accepted_at to the current time. Otherwise, it creates a new record.
 *
 * @param email - The user's email address.
 * @param tosVersion - The version of the Terms of Service.
 * @param ipAddress - The IP address of the user.
 * @param acceptanceMethod - Method of acceptance (e.g. 'implicit' or 'explicit').
 * @param location - Where the acceptance took place.
 */
export async function acceptTOS(
    email: string,
    tosVersion: string,
    ipAddress: string,
    acceptanceMethod: 'implicit' | 'explicit',
    location: string
): Promise<void> {
    const now = new Date().toISOString();
    const query = `
    INSERT INTO tos_acceptance 
      (email, tos_version, ip_address, location, acceptance_method, accepted_at)
    VALUES 
      ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (email, location) DO UPDATE SET
      tos_version = EXCLUDED.tos_version,
      ip_address = EXCLUDED.ip_address,
      acceptance_method = EXCLUDED.acceptance_method,
      accepted_at = EXCLUDED.accepted_at;
  `;

    await connectionPool.query(query, [
        email.toLowerCase(),
        tosVersion,
        ipAddress,
        location,
        acceptanceMethod,
        now,
    ]);
}
