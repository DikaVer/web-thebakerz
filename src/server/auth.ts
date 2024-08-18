import NextAuth from "next-auth"
import PostgresAdapter from "@auth/pg-adapter"
import { Pool } from "@neondatabase/serverless"
import Sendgrid from "next-auth/providers/sendgrid"

// *DO NOT* create a `Pool` here, outside the request handler.
// Neon's Postgres cannot keep a pool alive between requests.

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
    // Create a `Pool` inside the request handler.
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL })
    return {
        adapter: PostgresAdapter(pool),
        providers: [
            Sendgrid({
            // If your environment variable is named differently than default
            apiKey: process.env.AutH_SENDGRID_API_KEY,
            from: "no-reply@company.com"
        }),],
    }
})