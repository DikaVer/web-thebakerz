"use server";

import { cookies } from 'next/headers';

const DELIVERY_MODE_COOKIE = "deliveryMode";

export type DeliveryMode = 'pickup' | 'delivery';

export async function setDeliveryMode(mode: DeliveryMode) {
    const cookieStore = await cookies();
    cookieStore.set(DELIVERY_MODE_COOKIE, mode, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    });
}

export async function getDeliveryMode(): Promise<DeliveryMode> {
    const cookieStore = await cookies();
    return (cookieStore.get(DELIVERY_MODE_COOKIE)?.value as DeliveryMode) || 'pickup';
} 