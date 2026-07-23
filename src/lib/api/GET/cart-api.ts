/**
 * @fileoverview Server-only API client functions for reading cart data.
 *
 * Exports getCartAPI and getCartTypeAPI, which resolve the current user (or
 * guest session cookie) and fetch the cart for a store from the internal
 * /api/store/[storeId]/[userId]/cart endpoints using bearer token
 * authentication, tagged with the 'cart' cache tag and never cached.
 */
import 'server-only';

import { getCurrentSession } from "@/lib/actions/session";
import { getSessionCookie } from "@/lib/actions/session";
import { CartData, TypedCartData } from "../../actions/cart";

export const getCartAPI = async (
    storeId: string,
): Promise<TypedCartData> => {

    const session = await getCurrentSession();
    let userId;
    if (!session || !session.user) {
        userId = await getSessionCookie();
    } else {
        userId = session.user.id;
    }


    if (!userId) return {delivery: {}, pickup: {}};

    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/${storeId}/${userId}/cart`, {
        headers: {
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
        },
        next: {
            tags: ['cart'],
            revalidate: 0
        }
    }).then(res => res.json());

};

export const getCartTypeAPI = async (
    storeId: string,
    type: 'delivery' | 'pickup'
): Promise<CartData> => {

    const session = await getCurrentSession();
    let userId;
    if (!session || !session.user) {
        userId = await getSessionCookie();
    } else {
        userId = session.user.id;
    }


    if (!userId) return {};

    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/${storeId}/${userId}/cart/${type}`, {
        headers: {
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
        },
        next: {
            tags: ['cart'],
            revalidate: 0
        }
    }).then(res => res.json());

};