/**
 * @fileoverview Server-only Google OAuth client configuration.
 *
 * Instantiates and exports an Arctic Google OAuth provider configured with
 * client credentials from environment variables and the app's
 * /api/auth/google/callback redirect URL. Used by the Google sign-in flow.
 */
import 'server-only';
import { Google } from "arctic";

export const google = new Google(
    process.env.NEXT_PRIVATE_GOOGLE_CLIENT_ID ?? "",
    process.env.NEXT_PRIVATE_GOOGLE_CLIENT_SECRET ?? "",
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/google/callback`
);
