'use server';
import * as z from "zod";
import {ProductSchema} from "@/lib/schemas";
import {getCurrentSession} from "@/lib/actions/session";
import {globalPOSTRateLimit} from "@/lib/actions/requests";
import {v4 as uuidv4} from "uuid";
import {containerClientProduct, containerProducts} from "@/db";
import {getStoreIdByStoreName} from "@/lib/actions/store";


// This action is similar to your sendEmail function.
export const addProduct = async (
    formData: z.infer<typeof ProductSchema>,
    productId?: string,
) => {

    if (!await globalPOSTRateLimit()){
        return {
            error: "Too many requests"
        }
    }
    // Validate the form data
    const validation = ProductSchema.safeParse(formData);
    if (!validation.success) {
        return { error: "Invalid fields!" };
    }

    const {user, store} = await getCurrentSession();

    if (!user || !store) {
        return { error: "User not found!" };
    }

    // Determine which productId to use.
    const prodId = productId || uuidv4();

    // Build the product data object.
    const productData = {
        id: prodId,
        store_id: store.id,
        category: formData.category,
        name: formData.name,
        description: formData.description,
        price: formData.price * 100,
        picture: formData.url,
        updatedAt: new Date().toISOString()
    };

    try {
        if (productId) {
            await containerProducts.item(productData.id, productData.store_id).patch({
                operations: [
                    {
                        op: "set",
                        // Update the product name.
                        path: "/name",
                        value: productData.name,
                    },
                    {
                        op: "set",
                        // Update the product price.
                        path: "/price",
                        value: productData.price,
                    },
                    {
                        op: "set",
                        path: "/description",
                        value: productData.description ?? ""
                    },
                    {
                        op: "set",
                        // Update the product category.
                        path: "/category",
                        value: productData.category,
                    },
                    {
                        op: "set",
                        // Update the image URL.
                        path: "/picture",
                        value: productData.picture,
                    },
                    {
                        op: "set",
                        // Update the product category.
                        path: "/updatedAt",
                        value: new Date().toISOString(),
                    }
                    // Add any additional field updates as needed.
                ],
            });
        } else {
            await containerProducts.items.create(productData);
        }

        return { success: "Product updated successfully!", product: productData };
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

        // Delete the product document using its id and the storeId as the partition key.
        await containerProducts.item(productId, store.id).delete();
        return { success: "Product deleted successfully!" };
    } catch (error: any) {
        console.error("Error deleting product:", error);
        // Optionally, check for specific error codes (e.g., 404) to customize the message.
        return { error: "Failed to delete product." };
    }
};

export async function getProductsByStoreName(storeName: string): Promise<ProductDataFull> {
    try {
        const storeId = await getStoreIdByStoreName(storeName);

        if (!storeId) {
            return {};
        }

        const querySpec = {
            query: "SELECT * FROM c WHERE c.store_id = @storeId",
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


export type ProductData = {
    id: string;
    store_id: string;
    category: string;
    name: string;
    description?: string | null;
    price: number;
    picture: string;
};

export type ProductDataFull = {
    [productId: string]: ProductData;
};