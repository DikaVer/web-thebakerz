'use server';
import { containerFavorites } from "@/db";
import { getCurrentSession } from "./session"
import { revalidateTag } from "next/cache";
import { globalGETRateLimit, globalPOSTRateLimit } from "./requests";

export interface FavoriteData {
    id: string;
    userId: string;
    storeId: string;
    createdAt: string;
    productId?: string;
    metadata: {
        storeId?: string;
        storeName?: string;
        productId?: string;
        productName?: string;
        productImage?: string;
        storeBackground?: string;
    }
    type: "store" | "product";
}

export const addStoreFavorite = async (storeId: string, storeName: string, storeBackground: string) => {

    if (!(await globalPOSTRateLimit())) {
        return false;
    }

    const session = await getCurrentSession();
    if(!session?.user) {
        return false;
    }

    try {
        const favoriteData: FavoriteData = {
            id: `${session.user.id}-${storeId}`,
            userId: session.user.id,
            storeId: storeId,
            createdAt: new Date().toISOString(),
            type: "store",
            metadata: {
                storeName: storeName,
                storeBackground: storeBackground,
            }
        };

        const response = await containerFavorites.items.create(favoriteData);
        revalidateTag("favorites");
        return true;
    } catch (error) {
        console.error("Error adding favorite:", error);
        return false;
    }
}

export const removeStoreFavorite = async (storeId: string) => {

    if (!(await globalPOSTRateLimit())) {
        return false;
    }
    
    const session = await getCurrentSession();
    if(!session?.user) {
        return false;
    }   

    try {
        const itemId = `${session.user.id}-${storeId}`;
        const partitionKeyValue = session.user.id;
        await containerFavorites.item(itemId, partitionKeyValue).delete();
        revalidateTag("favorites");
        return true;
    } catch (error) {
        console.error("Error removing favorite:", error);
        return false;
    }
}

export const addProductFavorite = async (storeId: string, productId: string, productName: string, productImage: string) => {

    if (!(await globalPOSTRateLimit())) {
        return false;
    }

    const session = await getCurrentSession();
    if(!session?.user) {
        return false;
    }

    try {
        const favoriteData: FavoriteData = {
            id: `${session.user.id}-${storeId}-${productId}`,
            userId: session.user.id,
            storeId: storeId,
            productId: productId,
            createdAt: new Date().toISOString(),
            type: "product",
            metadata: {
                productName: productName,
                productImage: productImage,
            }
        };

        const response = await containerFavorites.items.create(favoriteData);
        revalidateTag("favorites");
        return true;
    } catch (error) {
        console.error("Error adding favorite:", error); 
        return false;
    }
}

export const removeProductFavorite = async (storeId: string, productId: string) => {

    if (!(await globalPOSTRateLimit())) {
        return false;
    }

    const session = await getCurrentSession();
    if(!session?.user) {
        return false;
    }

    try {
        const itemId = `${session.user.id}-${storeId}-${productId}`;
        const partitionKeyValue = session.user.id;
        await containerFavorites.item(itemId, partitionKeyValue).delete();
        revalidateTag("favorites");
        return true;
    } catch (error) {
        console.error("Error removing favorite:", error);
        return false;
    }
}

export const getStoreFavorites = async (userId: string): Promise<FavoriteData[]> => {

    // Query to get all favorites for the user
    const querySpec = {
        query: "SELECT c.storeId, c.metadata FROM c WHERE c.userId = @userId AND c.type = 'store' ORDER BY c.createdAt DESC",
        parameters: [
            { name: "@userId", value: userId }
        ]
    };

    const { resources: favorites } = await containerFavorites.items.query(querySpec).fetchAll();    
    return favorites;
}

export const getProductFavorites = async (userId: string): Promise<FavoriteData[]> => {
    
    const querySpec = {
        query: "SELECT c.productId, c.storeId, c.metadata FROM c WHERE c.userId = @userId AND c.type = 'product' ORDER BY c.createdAt DESC",
        parameters: [
            { name: "@userId", value: userId }
        ]
    };

    const { resources: favorites } = await containerFavorites.items.query(querySpec).fetchAll();    
    return favorites;
}

export const getProductFavoritesByStore = async (storeId: string, userId: string): Promise<FavoriteData[]> => {
    
    const querySpec = {
        query: "SELECT c.productId FROM c WHERE c.userId = @userId AND c.type = 'product' AND c.storeId = @storeId ORDER BY c.createdAt DESC",
        parameters: [
            { name: "@userId", value: userId },
            { name: "@storeId", value: storeId }
        ]
    };

    const { resources: favorites } = await containerFavorites.items.query(querySpec).fetchAll();    
    return favorites;
}

export const getTotalFavoritesStore = async (storeId: string): Promise<number> => {
    const querySpec = {
        query: "SELECT COUNT(c.id) as count FROM c WHERE c.storeId = @storeId AND c.type = 'store'",
        parameters: [
            { name: "@storeId", value: storeId }
        ]
    };

    const { resources: favorites } = await containerFavorites.items.query(querySpec).fetchAll();    
    return favorites[0]?.count || 0;
}

export const getTotalFavoritesStoreProduct = async (storeId: string): Promise<number> => {
    const querySpec = {
        query: "SELECT COUNT(c.id) as count FROM c WHERE c.storeId = @storeId AND c.type = 'product'",
        parameters: [
            { name: "@storeId", value: storeId }
        ]
    };

    const { resources: favorites } = await containerFavorites.items.query(querySpec).fetchAll();    
    
    return favorites[0]?.count || 0;
}

export const getTotalFavoritesProduct = async (productId: string): Promise<number> => {
    const querySpec = {
        query: "SELECT COUNT(c.id) as count FROM c WHERE c.productId = @productId AND c.type = 'product'",
        parameters: [
            { name: "@productId", value: productId }
        ]
    };

    const { resources: favorites } = await containerFavorites.items.query(querySpec).fetchAll();    
    return favorites[0]?.count || 0;
}


export const getProductFavoritesCountsByStore = async (storeId: string): Promise<{[productId: string]: number}> => {
    const querySpec = {
        query: "SELECT c.productId, COUNT(1) as count FROM c WHERE c.storeId = @storeId AND c.type = 'product' GROUP BY c.productId",
        parameters: [
            { name: "@storeId", value: storeId }
        ]
    };

    const { resources: favorites } = await containerFavorites.items.query(querySpec).fetchAll();
    
    // Convert the array of results to a map of productId -> count
    const favoritesMap: {[productId: string]: number} = {};
    favorites.forEach((item: any) => {
        if (item.productId) {
            favoritesMap[item.productId] = item.count;
        }
    });
    
    return favoritesMap;
}

export const getCurrentFavorites = async (purpose: "getStoreFavorites" | "getProductFavorites" | "getProductFavoritesByStore", storeId?:string): Promise<FavoriteData[]> => {
    
    const session = await getCurrentSession();
    if(!session?.user) {
        return [];
    }

    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/favorites`, {
        headers: {
            'User-Id': session.user.id,
            'Purpose': purpose,
            'Store-Id': storeId || "",
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
        },
        next: {
            tags: ['favorites'],
            revalidate: 0
        }
    }).then(res => res.json());
}

