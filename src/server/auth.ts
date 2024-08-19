import NextAuth from "next-auth"
import PostgresAdapter from "@auth/pg-adapter"
import { Pool } from "@neondatabase/serverless"
import Sendgrid from "next-auth/providers/sendgrid"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import Instagram from "next-auth/providers/instagram"

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
            apiKey: process.env.AUTH_SENDGRID_KEY,
            from: "no-reply@thebakerz.com"
        }),
            Google,
            Facebook,
            Instagram
        ],
        pages: {
            signIn: "/auth",
            signOut: "/auth",
            verifyRequest: "/auth/verify-request",
        }
    }
})