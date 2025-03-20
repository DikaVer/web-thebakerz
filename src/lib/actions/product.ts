'use server';
import * as z from "zod";
import {ProductSchema} from "@/lib/schemas";
import {getCurrentSession} from "@/lib/actions/session";
import {globalPOSTRateLimit} from "@/lib/actions/requests";
import {v4 as uuidv4} from "uuid";
import {containerProducts} from "@/db";
import {revalidateTag} from "next/cache";



/**
 * Adds a new product or updates an existing one in the database.
 *
 * Validates the form data, handles image upload, and creates or updates the product record.
 *
 * @param {z.infer<typeof ProductSchema>} formData - The product information.
 * @param {string} [productId] - The product ID to update. If omitted, a new product is added.
 * @returns {Promise<{ success?: string; error?: string; product?: object }>} The operation result.
 */
export const addProduct = async (
    formData: z.infer<typeof ProductSchema>,
    productId?: string
) => {
    if (!(await globalPOSTRateLimit())) return { error: "Too many requests" };

    const validation = ProductSchema.safeParse(formData);
    if (!validation.success) return { error: "Invalid fields!" };

    const { user, store } = await getCurrentSession();
    if (!user || !store) return { error: "User not found!" };

    let oldProductData = null;
    if (productId) {
        const { resource } = await containerProducts.item(productId, store.id).read();
        oldProductData = resource;
    }

    // 2. Prepare updatedAdditionalImages with a copy of existing ones.
    let updatedAdditionalImages = [...formData.additionalImages];

    // 3. If new additional pictures are provided, upload and replace/append.
    if (formData.file_additional_pictures && formData.file_additional_pictures.length > 0) {
        for (let i = 0; i < formData.file_additional_pictures.length; i++) {
            const fileToUpload = formData.file_additional_pictures[i];

            if (!fileToUpload) {continue;}
            // Upload the file as done for `file_picture`:
            const fd = new FormData();
            fd.append("file", fileToUpload, "image.webp");
            fd.append("container", "products");
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload-image`,
                {
                    method: "POST",
                    body: fd,
                    headers: {
                      "Authorization": `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
                    },
                }
            );
            if (!response.ok) {
              return { error: "Failed to upload image" };
            }
            const { url: newUrl } = await response.json();
            if (!newUrl) return { error: "Failed to upload image" };

            // Replace if an old URL exists at the same index, otherwise append.
            if (updatedAdditionalImages[i]) {
              updatedAdditionalImages[i] = newUrl;
            } else {
              updatedAdditionalImages.push(newUrl);
            }
      }
    }
    console.log(updatedAdditionalImages);

    let image_url;
    if (formData.file_picture) {
        const fd = new FormData();
        fd.append("file", formData.file_picture, "image.webp");
        fd.append("container", "products");

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload-image`,
            {
                method: "POST",
                body: fd,
                headers: {
                    "Authorization": `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
                },
            }
        );
        if (!response.ok) {
            console.error("Failed to upload image");
            return { error: "Failed to upload image" };
        }
        const { url } = await response.json();
        if (!url) return { error: "Failed to upload image" };
        image_url = url;
    }

    const now = new Date().toISOString();
    const productData = {
        id: uuidv4(),
        store_id: store.id,
        category: formData.category,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        picture: image_url || formData.url,
        ingredients: formData.ingredients || [],
        allergies: formData.allergies || [],
        createdAt: oldProductData ? oldProductData.createdAt : now,
        updatedAt: now,
        historySnapshots: oldProductData
            ? [...(oldProductData.historySnapshots || []), { id: oldProductData.id, date: now }]
            : [],
        archive: false,
        constId: oldProductData ? oldProductData.constId : uuidv4(),
        additionalImages: updatedAdditionalImages,
    };

    try {
        if (productId) {
            await containerProducts.item(productId, store.id).patch({
                operations: [
                    { op: "set", path: "/archive", value: true },
                    { op: "set", path: "/archivedAt", value: now },
                ],
            });
            await containerProducts.items.create(productData);
            revalidateTag("products");
            return { success: "Product updated!", product: productData };
        } else {
            await containerProducts.items.create(productData);
            revalidateTag("products");
            return { success: "Product added!", product: productData };
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
            query: "SELECT c.id, c.store_id, c.category, c.name, c.description, c.price, c.picture, c.ingredients, c.allergies, c.constId, c.additionalImages FROM c WHERE c.store_id = @storeId AND c.archive = false",
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
                'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
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
    additionalImages: string[];
};

export type ProductDataFull = {
    [productId: string]: ProductData;
};