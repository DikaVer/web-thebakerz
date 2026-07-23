/**
 * @fileoverview Server-only API client functions for reading product data.
 *
 * Exports getProductsAPI, getProductsOrderAPI, and
 * getProductByStoreIdAndProductIdAPI, which fetch a store's product catalog,
 * its product display ordering, and a single product from the internal
 * /api/store/[storeId] endpoints using bearer token authentication, cached
 * for 300 seconds under the 'products' tag.
 */
import 'server-only';
import { ProductData, ProductDataFull } from "../../actions/product";

export async function getProductsAPI(storeId: string): Promise<ProductDataFull> {
    try {
        if (!storeId) {
            return {};
        }

        const products = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/${storeId}/products`, {
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
            },
            next: {
                tags: ['products'],
                revalidate: 300
            }
        }).then(res => res.json());


        return products;
    } catch (error) {
        console.error("Error fetching store products:", error);
        throw new Error("Failed to fetch store products");
    }
}

export async function getProductsOrderAPI(storeId: string): Promise<Record<string, string[]>> {
    try {
        if (!storeId) {
            return {};
        }

        const products = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/${storeId}/products-order`, {
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
            },
            next: {
                tags: ['products'],
                revalidate: 300
            }
        }).then(res => res.json());


        return products;
    } catch (error) {
        console.error("Error fetching store products:", error);
        throw new Error("Failed to fetch store products");
    }
}


export async function getProductByStoreIdAndProductIdAPI(storeId: string, productId: string): Promise<ProductData | null> {
    try {
        if (!storeId || !productId) {
            return null;
        }

        const product = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/${storeId}/products/${productId}`, {
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
            },
            next: {
                tags: ['products'],
                revalidate: 300
            }
        }).then(res => res.json());


        return product;
    } catch (error) {
        console.error("Error fetching store products:", error);
        throw new Error("Failed to fetch store products");
    }
}