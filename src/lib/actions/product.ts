'use server';
import * as z from "zod";
import {ProductSchema} from "@/lib/schemas";
import {getCurrentSession} from "@/lib/actions/session";
import {globalPOSTRateLimit} from "@/lib/actions/requests";
import {v4 as uuidv4} from "uuid";
import {containerProducts} from "@/db";
import {revalidateTag} from "next/cache";



// This action is similar to your sendEmail function.
export const addProduct = async (
    formData: z.infer<typeof ProductSchema>,
    productId?: string
) => {
    if (!(await globalPOSTRateLimit())) {
        return { error: "Too many requests" };
    }
    // Validate the form data
    const validation = ProductSchema.safeParse(formData);
    if (!validation.success) {
        return { error: "Invalid fields!" };
    }

    const { user, store } = await getCurrentSession();
    if (!user || !store) {
        return { error: "User not found!" };
    }

    // Fetch the old product data if updating
    let oldProductData = null;
    if (productId) {
        const oldProduct = await containerProducts.item(productId, store.id).read();
        oldProductData = oldProduct.resource;
    }

    const productData = {
        id: uuidv4(),
        store_id: store.id,
        category: formData.category,
        name: formData.name,
        description: formData.description,
        price: formData.price * 100,
        picture: formData.url,
        ingredients: formData.ingredients || [],
        allergies: formData.allergies || [],
        createdAt: oldProductData ? oldProductData.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        historySnapshots: oldProductData
            ? [...(oldProductData.historySnapshots || []), {
                id: oldProductData.id, date: new Date().toISOString(),
            }]
            : [],
        archive: false,
        constId: oldProductData ? oldProductData.constId : uuidv4(),
    };

    try {
        if (productId) {

            // Update the product's archive status to true.
            await containerProducts.item(productId, store.id).patch({
                operations: [
                    { op: "set", path: "/archive", value: true },
                    { op: "set", path: "/archivedAt", value: new Date().toISOString()}
                ],
            });


            await containerProducts.items.create(productData);
            revalidateTag('products');
            return { success: "Products updated!", product: productData };

        } else {

            await containerProducts.items.create(productData);
            revalidateTag('products');
            return { success: "Products added!", product: productData };
        }

    } catch (error: any) {
        console.error("Error updating product:", error);
        return { error: "Failed to update product." };
    }
};

/**
 * Deletes a product document from Cosmos DB.
 *
 * @param productId - The unique ID of the product to delete.
 * @param storeId - The store's ID (used as the partition key).
 * @returns A promise resolving to a success message or an error message.
 */
export const deleteProduct = async (
    productId: string
): Promise<{ success?: string; error?: string }> => {
    try {
        if (!await globalPOSTRateLimit()){
            return {
                error: "Too many requests"
            }
        }

        const {user, store} = await getCurrentSession();

        if (!user || !store) {
            return { error: "User not found!" };
        }


        // Update the product's archive status to true.
        await containerProducts.item(productId, store.id).patch({
            operations: [
                { op: "set", path: "/archive", value: true },
                { op: "set", path: "/archivedAt", value: new Date().toISOString()}
            ],
        });

        revalidateTag('products');
        return { success: "Product deleted successfully!" };
    } catch (error: any) {
        console.error("Error deleting product:", error);
        // Optionally, check for specific error codes (e.g., 404) to customize the message.
        return { error: "Failed to delete product." };
    }
};

export async function getProductsByStoreId(storeId: string): Promise<ProductDataFull> {
    try {

        if (!storeId) {
            return {};
        }

        const querySpec = {
            query: "SELECT c.id, c.store_id, c.category, c.name, c.description, c.price, c.picture, c.ingredients, c.allergies, c.constId FROM c WHERE c.store_id = @storeId AND c.archive = false",
            parameters: [{ name: "@storeId", value: storeId }]
        };

        const { resources: products } = await containerProducts.items
            .query(querySpec, { partitionKey: storeId })
            .fetchAll();


        const productDataFull: ProductDataFull = {};
        products.forEach((product: ProductData) => {
            productDataFull[product.id] = product;
        });

        return productDataFull;
    } catch (error) {
        console.error("Error fetching store products:", error);
        throw new Error("Failed to fetch store products");
    }
}

export async function getCurrentProducts(storeId: string): Promise<ProductDataFull> {
    try {

        if (!storeId) {
            return {};
        }

        return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/products`, {
            headers: {
                'Store-Id': storeId,
            },
            next: {
                tags: ['products'],
                revalidate: 300
            }
        }).then(res => res.json());

    } catch (error) {
        console.error("Error fetching store products:", error);
        throw new Error("Failed to fetch store products");
    }
}


export type ProductData = {
    id: string;
    store_id: string;
    category: string;
    name: string;
    description?: string | null;
    price: number;
    picture: string;
    ingredients?: string[];
    allergies?: string[];
    constId: string;
};

export type ProductDataFull = {
    [productId: string]: ProductData;
};