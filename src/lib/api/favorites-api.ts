'use server';
import { getCurrentSession } from "@/lib/actions/session";
import { FavoriteData } from "../actions/favorites";


export const getCurrentStoreFavorites = async (): Promise<FavoriteData[]> => {
    
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

export const getCurrentProductFavorites = async (): Promise<FavoriteData[]> => {
    
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

export const getCurrentFavoritesByStore = async (storeId:string): Promise<FavoriteData[]> => {
    
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