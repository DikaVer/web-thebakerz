import 'server-only';

import { getCurrentSession } from "@/lib/actions/session";
import { getSessionCookie } from "@/lib/actions/session";
import { CartData, TypedCartData } from "../actions/cart";

export const getCurrentCart = async (
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
            revalidate: 300
        }
    }).then(res => res.json());

};

export const getCurrentCartType = async (
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
            revalidate: 300
        }
    }).then(res => res.json());

};