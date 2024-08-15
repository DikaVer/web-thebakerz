import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/auth',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;