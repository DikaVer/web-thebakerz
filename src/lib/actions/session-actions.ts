'use server';

import { auth } from "@/auth";
import { CustomAdapterUser } from "@/lib/definitions";


/**
 * Extracts the role and name of the current user session.
 *
 * @returns {Promise<{authActions: boolean, role?: string, name?: string}>} - An object containing authActions status, role, and name.
 */
export async function extractSessionRole() {
    // Retrieve the session information by authenticating the user
    const session = await auth();

    // Check if the session exists (i.e., the user is logged in)
    const login = Boolean(session);

    // Initialize role and name to undefined
    let role: string | undefined;
    let name: string | undefined | null;

    // If the user is logged in, extract role and name from the session object
    if (login) {
        const user = session?.user as CustomAdapterUser;
        role = user.role;
        name = user.name;
    }

    // Return an object containing the authActions status, role, and name
    return {login, role, name};
}
