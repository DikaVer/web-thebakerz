import 'server-only';
import { Google } from "arctic";

export const google = new Google(
    process.env.NEXT_PRIVATE_GOOGLE_CLIENT_ID ?? "",
    process.env.NEXT_PRIVATE_GOOGLE_CLIENT_SECRET ?? "",
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/google/callback`
);
