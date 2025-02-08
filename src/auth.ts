// import NextAuth from "next-auth"
// import PostgresAdapter from '@/lib/adapter/postgreAdapter'
// import { Pool } from "pg"
// import Google from "next-auth/providers/google"
// import Facebook from "next-auth/providers/facebook"
// import Instagram from "next-auth/providers/instagram"
// import {CustomAdapterUser} from "@/lib/definitions";
//
//
// export const {
//     handlers,
//     auth,
//     signIn,
//     signOut
// } = NextAuth( () => {
//
//     const pool = new Pool({
//         host: process.env.DATABASE_HOST,
//         user: process.env.DATABASE_USER,
//         password: process.env.DATABASE_PASSWORD,
//         database: process.env.DATABASE_NAME,
//         ssl: true,
//         max: 20,
//         idleTimeoutMillis: 30000,
//         connectionTimeoutMillis: 2000,
//     })
//
//     const adapter = PostgresAdapter(pool)
//
//
//     return {
//         adapter: adapter,
//         trustHost: true,
//         providers: [
//             Google({
//                 clientId: process.env.AUTH_GOOGLE_ID,
//                 clientSecret: process.env.AUTH_GOOGLE_SECRET,
//                 allowDangerousEmailAccountLinking: true,
//                 profile(profile) {
//                     return {
//                         role: profile.role ?? "user",
//                         ...profile
//                     };
//                 },
//
//             }),
//             Facebook({
//                 clientId: process.env.AUTH_FACEBOOK_ID,
//                 clientSecret: process.env.AUTH_FACEBOOK_SECRET,
//                 profile(profile) {
//                     return {
//                         role: profile.role ?? "user",
//                         ...profile
//                     };
//                 }
//             }),
//             Instagram({
//                 clientId: process.env.AUTH_INSTAGRAM_ID,
//                 clientSecret: process.env.AUTH_INSTAGRAM_SECRET,
//                 profile(profile) {
//                     return {
//                         email: profile.email,
//                         role: profile.role ?? "user",
//                         ...profile
//                     };
//                 }
//             }),
//         ],
//         pages: {
//             signIn: "/auth",
//             signOut: "/auth",
//             error: '/error',
//             verifyRequest: "/auth/verify",
//         },
//         events: {
//           async linkAccount({ user }) {
//               await pool.query("UPDATE users SET \"emailVerified\" = $1 WHERE id = $2", [new Date(), user.id])
//           }
//         },
//         callbacks: {
//             async session({ session, user }) {
//                 (session.user as CustomAdapterUser).role = (user as CustomAdapterUser).role;
//                 return session;
//             },
//             authorized: async ({ auth }) => {
//                 return !!auth;
//             },
//         },
//         session: { strategy: "database" },
//         secret: process.env.AUTH_SECRET
//     }
// })