import 'server-only';
import { ProductData, ProductDataFull } from "../actions/product";

export async function getCurrentProducts(storeId: string): Promise<ProductDataFull> {
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
                revalidate: 0
            }
        }).then(res => res.json());


        return products;
    } catch (error) {
        console.error("Error fetching store products:", error);
        throw new Error("Failed to fetch store products");
    }
}


export async function getCurrentProductByStoreIdAndProductId(storeId: string, productId: string): Promise<ProductData | null> {
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