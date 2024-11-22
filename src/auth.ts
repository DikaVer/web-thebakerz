import NextAuth from "next-auth"
import PostgresAdapter from '@/lib/adapter/postgreAdapter'
import { Pool } from "@neondatabase/serverless";
import Sendgrid from "next-auth/providers/sendgrid"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import Instagram from "next-auth/providers/instagram"
import {sendMagicLink} from "@/lib/authSendRequest";
import {CustomAdapterUser} from "@/lib/definitions";
import {cookies} from "next/headers";

// *DO NOT* create a `Pool` here, outside the request handler.
// Neon's Postgres cannot keep a pool alive between requests.

export const {
    handlers,
    auth,
    signIn,
    signOut
} = NextAuth( () => {
    // Create a `Pool` inside the request handler.
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL })
    const adapter = PostgresAdapter(pool)
    // const cookieHeader = await cookies(); // Await the cookies() call here
    // const sessionCookie = cookieHeader.get("next-auth.session-token");

    return {
        adapter: adapter,
        providers: [
            Sendgrid({
                server: process.env.AUTH_EMAIL_SERVER,
                from: process.env.EMAIL_FROM,
                maxAge: 24 * 60 * 60, // 24 hours
                sendVerificationRequest({ identifier: email, url,
                                            provider: { server, from},
                                        }) {
                    sendMagicLink({
                        identifier: email,
                        url
                    });
                },
            },
            ),
            Google({
                clientId: process.env.AUTH_GOOGLE_ID,
                clientSecret: process.env.AUTH_GOOGLE_SECRET,
                allowDangerousEmailAccountLinking: true,
                profile(profile) {
                    return {
                        role: profile.role ?? "user",
                        ...profile
                    };
                },

            }),
            Facebook({
                clientId: process.env.AUTH_FACEBOOK_ID,
                clientSecret: process.env.AUTH_FACEBOOK_SECRET,
                profile(profile) {
                    return {
                        role: profile.role ?? "user",
                        ...profile
                    };
                }
            }),
            Instagram({
                clientId: process.env.AUTH_INSTAGRAM_ID,
                clientSecret: process.env.AUTH_INSTAGRAM_SECRET,
                profile(profile) {
                    return {
                        email: profile.email,
                        role: profile.role ?? "user",
                        ...profile
                    };
                }
            }),
        ],
        pages: {
            signIn: "/auth",
            signOut: "/auth",
            error: '/error',
            verifyRequest: "/auth/verify",
        },
        events: {
          async linkAccount({ user }) {
              await pool.query("UPDATE users SET \"emailVerified\" = $1 WHERE id = $2", [new Date(), user.id])
          }
        },
        callbacks: {
            async session({ session, user }) {
                (session.user as CustomAdapterUser).role = (user as CustomAdapterUser).role;
                return session;
            },
            authorized: async ({ auth }) => {
                return !!auth;
            },
        },
        session: { strategy: "database" },
        secret: process.env.AUTH_SECRET
    }
})