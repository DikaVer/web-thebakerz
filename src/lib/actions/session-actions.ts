"use server";

import {getCurrentSession} from "@/lib/actions/session";


/**
 * Extracts the role and name of the current user session.
 *
 * @returns {Promise<{authActions: boolean, role?: string, name?: string}>} - An object containing authActions status, role, and name.
 */
export const extractSession = async () => {
    // Retrieve the session information by authenticating the user
    const { session, user } = await getCurrentSession();

    // Check if the session exists (i.e., the user is logged in)
    const login = Boolean(session);

    if (user === null) {
        // Return an object containing the authActions status
        return { login };
    }

    // Return an object containing the authActions status, role, and name
    return { login, role: user.role, name: user.username, email: user.email };
};