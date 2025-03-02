import { connectionPool } from '@/db';

/**
 * Inserts a record into the tos_acceptance table.
 *
 * @param email - The user's email address.
 * @param tosVersion - The version of the Terms of Service.
 * @param ipAddress - The IP address of the user.
 * @param acceptanceMethod - Method of acceptance (e.g. 'implicit' or 'explicit').
 * @param location - (Optional) Where the acceptance took place.
 * @param tosHash - (Optional) SHA-256 hash of the TOS content.
 */
export async function acceptTOS(
    email: string,
    tosVersion: string,
    ipAddress: string,
    acceptanceMethod: 'implicit' | 'explicit',
    location: string
): Promise<void> {
    const query = `
    INSERT INTO tos_acceptance 
      (email, tos_version, ip_address, location, acceptance_method)
    VALUES 
      ($1, $2, $3, $4, $5)
  `;

    await connectionPool.query(query, [
        email,
        tosVersion,
        ipAddress,
        location,
        acceptanceMethod,
    ]);
}