/**
 * @fileoverview API client functions for reading the current user's favorites.
 *
 * Exports getStoreFavoritesAPI, getProductFavoritesAPI, and
 * getFavoritesByStoreAPI, which resolve the logged-in user from the session
 * and fetch favorite stores and products from the internal
 * /api/user/[userId]/favorites endpoints using bearer token authentication,
 * cached for 300 seconds under the 'favorites' tag.
 */
'use server';
import { getCurrentSession } from "@/lib/actions/session";
import { FavoriteData } from "../../actions/favorites";


export const getStoreFavoritesAPI = async (): Promise<FavoriteData[]> => {
    
    const session = await getCurrentSession();  
    if(!session?.user) {
        return [];
    }

    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/${session.user.id}/favorites/store`, {
        headers: {
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
        },
        next: {
            tags: ['favorites'],
            revalidate: 300
        }
    }).then(res => res.json());
}

export const getProductFavoritesAPI = async (): Promise<FavoriteData[]> => {
    
    const session = await getCurrentSession();  
    if(!session?.user) {
        return [];
    }

    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/${session.user.id}/favorites/product`, {
        headers: {
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
        },
        next: {
            tags: ['favorites'],
            revalidate: 300
        }
    }).then(res => res.json());
}

export const getFavoritesByStoreAPI = async (storeId:string): Promise<FavoriteData[]> => {
    
    const session = await getCurrentSession();  
    if(!session?.user) {
        return [];
    }

    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/${session.user.id}/favorites/${storeId}`, {
        headers: {
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
        },
        next: {
            tags: ['favorites'],
            revalidate: 300
        }
    }).then(res => res.json());
}