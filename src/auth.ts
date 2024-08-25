import NextAuth from "next-auth"
import PostgresAdapter from "@auth/pg-adapter"
import { Pool } from "@neondatabase/serverless"
import Sendgrid from "next-auth/providers/sendgrid"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import Instagram from "next-auth/providers/instagram"
import {sendMagicLink} from "@/lib/authSendRequest";

// *DO NOT* create a `Pool` here, outside the request handler.
// Neon's Postgres cannot keep a pool alive between requests.

export const {
    handlers,
    auth,
    signIn,
    signOut
} = NextAuth(() => {
    // Create a `Pool` inside the request handler.
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL })
    return {
        adapter: PostgresAdapter(pool),
        providers: [
            Sendgrid({
                server: process.env.EMAIL_SERVER,
                from: process.env.EMAIL_FROM,
                sendVerificationRequest({
                                            identifier: email,
                                            url,
                                            provider: { server, from},
                                        })
                {
                    sendMagicLink({
                        identifier: email,
                        url
                    })
                }
            }),
            Google,
            Facebook,
            Instagram,
        ],
        pages: {
            signIn: "/auth",
            signOut: "/auth",
            error: '/error',
            verifyRequest: "/auth/verify-request",
        },
        callbacks: {
            authorized: async ({ auth }) => {

                return !!auth
            },
        },
        secret: process.env.NEXTAUTH_SECRET
    }
})