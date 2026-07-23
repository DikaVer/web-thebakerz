/**
 * @fileoverview API route handling POST /api/user/favorites/refresh-metadata, which refreshes cached metadata on favorites.
 *
 * Finds store and product favorites in Cosmos DB whose metadata is older than 24 hours,
 * groups them by store or product to minimize lookups, refetches current store and product
 * data, upserts the updated favorite documents, and revalidates the favorites cache tag.
 * Requires a bearer token matching NEXT_PRIVATE_SECRET_BEARER and is intended for scheduled
 * invocation. Returns a JSON summary with processed and error counts.
 */
import { NextRequest, NextResponse } from "next/server";
import { containerFavorites, containerProducts } from "@/db";
import { getStoreAPI } from "@/lib/api/GET/store-api";
import { getProductByStoreIdAndProductIdAPI } from "@/lib/api/GET/products-api";
import { revalidateTag } from "next/cache";

// Types
interface FavoriteData {
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
        lastUpdated?: string;
        storeLocation?: {
            city?: string;
            region?: string;
        };
        storeIsOpen?: boolean;
        totalProducts?: number;
        productPrice?: number;
        productAvailable?: boolean;
        productCategory?: string;
    }
    type: "store" | "product";
}

export async function POST(request: NextRequest) {
    try {
        // Verify the request is authorized (you can enhance this)
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || authHeader !== `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Get all favorites that need metadata refresh (older than 24 hours or no lastUpdated)
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        
        const querySpec = {
            query: `SELECT * FROM c WHERE 
                (c.metadata.lastUpdated < @yesterday OR IS_NULL(c.metadata.lastUpdated))
                AND c.type IN ('store', 'product')`,
            parameters: [
                { name: "@yesterday", value: yesterday }
            ]
        };

        const { resources: staleFavorites } = await containerFavorites.items.query(querySpec).fetchAll();
        
        console.log(`Found ${staleFavorites.length} favorites needing metadata refresh`);

        if (staleFavorites.length === 0) {
            return NextResponse.json({ 
                success: true, 
                message: 'No favorites need updating',
                processed: 0,
                errors: 0
            });
        }

        // Group favorites by type and unique identifiers to optimize database calls
        const storeFavorites = staleFavorites.filter(f => f.type === 'store');
        const productFavorites = staleFavorites.filter(f => f.type === 'product');

        // Group store favorites by storeId
        const storeFavoritesByStoreId = new Map<string, FavoriteData[]>();
        storeFavorites.forEach(favorite => {
            if (!storeFavoritesByStoreId.has(favorite.storeId)) {
                storeFavoritesByStoreId.set(favorite.storeId, []);
            }
            storeFavoritesByStoreId.get(favorite.storeId)!.push(favorite);
        });

        // Group product favorites by storeId + productId
        const productFavoritesByKey = new Map<string, FavoriteData[]>();
        productFavorites.forEach(favorite => {
            const key = `${favorite.storeId}-${favorite.productId}`;
            if (!productFavoritesByKey.has(key)) {
                productFavoritesByKey.set(key, []);
            }
            productFavoritesByKey.get(key)!.push(favorite);
        });

        let processedCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        console.log(`Processing ${storeFavoritesByStoreId.size} unique stores and ${productFavoritesByKey.size} unique products`);

        // Process store favorites - one database call per unique store
        for (const [storeId, favorites] of storeFavoritesByStoreId) {
            try {
                await refreshStoreFavoritesGroup(storeId, favorites);
                processedCount += favorites.length;
                console.log(`✅ Updated ${favorites.length} store favorites for store ${storeId}`);
            } catch (error) {
                const errorMsg = `Failed to refresh store metadata for storeId ${storeId} (${favorites.length} favorites): ${error}`;
                console.error(errorMsg);
                errors.push(errorMsg);
                errorCount += favorites.length;
            }
        }

        // Process product favorites - one database call per unique product
        for (const [productKey, favorites] of productFavoritesByKey) {
            try {
                const [storeId, productId] = productKey.split('-');
                await refreshProductFavoritesGroup(storeId, productId, favorites);
                processedCount += favorites.length;
                console.log(`✅ Updated ${favorites.length} product favorites for product ${productId}`);
            } catch (error) {
                const errorMsg = `Failed to refresh product metadata for ${productKey} (${favorites.length} favorites): ${error}`;
                console.error(errorMsg);
                errors.push(errorMsg);
                errorCount += favorites.length;
            }
        }

        // Revalidate the favorites cache
        revalidateTag('favorites', 'max');

        return NextResponse.json({
            success: true,
            message: 'Metadata refresh completed',
            total: staleFavorites.length,
            processed: processedCount,
            errors: errorCount,
            optimization: {
                uniqueStores: storeFavoritesByStoreId.size,
                uniqueProducts: productFavoritesByKey.size,
                totalDatabaseCalls: storeFavoritesByStoreId.size + productFavoritesByKey.size,
                previousCalls: staleFavorites.length // What it would have been without optimization
            },
            errorDetails: errors.slice(0, 10) // Limit error details to first 10
        });

    } catch (error) {
        console.error('Error during favorites metadata refresh:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: String(error) },
            { status: 500 }
        );
    }
}

async function refreshStoreFavoritesGroup(storeId: string, favorites: FavoriteData[]) {
    try {
        // Get fresh store data once for all favorites of this store
        const storeData = await getStoreAPI(storeId);

        // Simple business hours check (you can enhance this with actual schedule logic)
        const now = new Date();
        const currentHour = now.getHours();
        const isOpen = currentHour >= 8 && currentHour <= 22;

        // Prepare the metadata that will be applied to all favorites of this store
        const sharedMetadata = {
            storeName: storeData?.storeName,
            storeBackground: storeData?.background,
            storeLocation: {
                city: storeData?.location?.city,
                region: storeData?.region
            },
            storeIsOpen: storeData ? !storeData.hidden : false,
            lastUpdated: new Date().toISOString()
        };

        // Update all favorites for this store in parallel
        const updatePromises = favorites.map(async (favorite) => {
            const updatedFavorite = {
                ...favorite,
                metadata: {
                    ...favorite.metadata,
                    ...sharedMetadata
                }
            };
            return containerFavorites.items.upsert(updatedFavorite);
        });

        await Promise.all(updatePromises);
        
    } catch (error) {
        console.error(`Error refreshing store metadata for ${storeId}:`, error);
        throw error;
    }
}

async function refreshProductFavoritesGroup(storeId: string, productId: string, favorites: FavoriteData[]) {
    try {
        // Get fresh product data once for all favorites of this product
        const productData = await getProductByStoreIdAndProductIdAPI(storeId, productId);
        
        // Prepare the metadata that will be applied to all favorites of this product
        const sharedMetadata = {
            productName: productData?.name,
            productImage: productData?.picture,
            productPrice: productData?.price,
            productAvailable: productData !== null,
            productCategory: productData?.category,
            lastUpdated: new Date().toISOString()
        };

        // Update all favorites for this product in parallel
        const updatePromises = favorites.map(async (favorite) => {
            const updatedFavorite = {
                ...favorite,
                metadata: {
                    ...favorite.metadata,
                    ...sharedMetadata
                }
            };
            return containerFavorites.items.upsert(updatedFavorite);
        });

        await Promise.all(updatePromises);
        
    } catch (error) {
        console.error(`Error refreshing product metadata for ${productId}:`, error);
        throw error;
    }
} 