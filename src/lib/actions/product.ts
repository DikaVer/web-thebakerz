'use server';
import * as z from "zod";
import {ProductSchema} from "@/lib/utils/schemas";
import {getCurrentSession} from "@/lib/actions/session";
import {globalPOSTRateLimit} from "@/lib/actions/requests";
import {v4 as uuidv4} from "uuid";
import {containerProducts, containerCart} from "@/db";
import {revalidateTag} from "next/cache";
import { getTranslations } from "next-intl/server";
import { getCartItemsByProductId } from "@/lib/actions/cart";
import {getCurrentStoreByUserIdAndStoreId} from "@/lib/actions/store";
import { getTotalFavoritesProduct,getProductFavoritesCountsByStore } from "./favorites";


type TranslationFunction = (key: string, params?: Record<string, string | number>) => string;

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
    storeId: string,
    productId?: string
) => {
    const t = await getTranslations("app/lib/actions/product") as TranslationFunction;
    
    if (!(await globalPOSTRateLimit())) return { error: t("tooManyRequests") };

    const validation = ProductSchema.safeParse(formData);
    if (!validation.success) return { error: t("invalidFields") };

    const { user } = await getCurrentSession();
    if (!user) return { error: t("userNotFound") };

    const { store } = await getCurrentStoreByUserIdAndStoreId(user.id, storeId);
    if (!store) return { error: t("storeNotFound") };

    let oldProductData = null;
    if (productId) {
        const { resource } = await containerProducts.item(productId, store.id).read();
        oldProductData = resource;
    }


    const now = new Date().toISOString();
    const productData = {
        id: uuidv4(),
        store_id: store.id,
        store_name: store.storeName,
        web_name: formData.name.replace(/\s+/g, '-'),
        category: formData.category,
        name: formData.name,
        description: formData.description,
        min_order: formData.min_order,
        min_lead_time: formData.min_lead_time,
        variants: formData.variants,
        price: formData.price,
        picture: formData.url,
        ingredients: formData.ingredients || [],
        allergies: formData.allergies || [],
        dietary: formData.dietary || [],
        createdAt: oldProductData ? oldProductData.createdAt : now,
        updatedAt: now,
        historySnapshots: oldProductData
            ? [...(oldProductData.historySnapshots || []), { id: oldProductData.id, date: now }]
            : [],
        archive: false,
        constId: oldProductData ? oldProductData.constId : uuidv4(),
        additionalImages: formData.additionalImages,
        hide_product: formData.hide_product,
        isPostDelivery: formData.isPostDelivery,
    };

    try {
        if (productId) {
            // Get all cart items for this product
            const cartItems = await getCartItemsByProductId(store.id, productId);
            
            // Delete all cart items for this product
            if (cartItems.length > 0) {
                await Promise.all(
                    cartItems.map(async (item) => {
                        const partitionKeyValue = [store.id, item.user_id];
                        await containerCart.item(item.id, partitionKeyValue).delete();
                    })
                );
            }

            await containerProducts.item(productId, store.id).patch({
                operations: [
                    { op: "set", path: "/archive", value: true },
                    { op: "set", path: "/archivedAt", value: now },
                ],
            });
            await containerProducts.items.create(productData);
            revalidateTag("products");
            revalidateTag("cart");
            return { success: t("productUpdated"), product: productData };
        } else {
            await containerProducts.items.create(productData);
            revalidateTag("products");
            return { success: t("productAdded"), product: productData };
        }
    } catch (error: any) {
        console.error("Error updating product:", error);
        return { error: t("failedUpdateProduct") };
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
    productId: string,
    storeId: string
): Promise<{ success?: string; error?: string }> => {
    try {
        if (!await globalPOSTRateLimit()){
            return {
                error: "Too many requests"
            }
        }

        const {user} = await getCurrentSession();

        if (!user) {
            return { error: "User not found!" };
        }

        const { store } = await getCurrentStoreByUserIdAndStoreId(user.id, storeId);
        if (!store) {
            return { error: "Store not found!" };
        }

        // console.log("Deleting product with ID:", productId, "from store with ID:", storeId);


        // Update the product's archive status to true.
        await containerProducts.item(productId, store.id).patch({
            operations: [
                { op: "set", path: "/archive", value: true },
                { op: "set", path: "/archivedAt", value: new Date().toISOString()}
            ],
        });

        // Get all cart items for this product
        const cartItems = await getCartItemsByProductId(store.id, productId);

        // Delete all cart items for this product
        if (cartItems.length > 0) {
            await Promise.all(
                cartItems.map(async (item) => {
                    const partitionKeyValue = [store.id, item.user_id];
                    await containerCart.item(item.id, partitionKeyValue).delete();
                })
            );
        }

        revalidateTag('products');
        revalidateTag("cart");
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
            query: "SELECT c.id, c.store_id, c.store_name, c.web_name, c.category, c.name, c.description, c.price, c.picture, c.ingredients, c.allergies, c.dietary, c.constId, c.additionalImages, c.variants, c.min_order, c.min_lead_time, c.hide_product, c.isPostDelivery FROM c WHERE c.store_id = @storeId AND c.archive = false",
            parameters: [{ name: "@storeId", value: storeId }]
        };

        const { resources: products } = await containerProducts.items
            .query(querySpec, { partitionKey: storeId })
            .fetchAll();

        // Get likes counts for all products in the store
        const productFavoriteCounts = await getProductFavoritesCountsByStore(storeId);

        const productDataFull: ProductDataFull = {};
        products.forEach((product: ProductData) => {
            // Assign the like count to each product, defaulting to 0 if not found
            product.totalLikes = productFavoriteCounts[product.constId] || 0;
            productDataFull[product.id] = product;
        });

        return productDataFull;
    } catch (error) {
        console.error("Error fetching store products:", error);
        throw new Error("Failed to fetch store products");
    }
}

export async function getProductByStoreIdAndWebName(storeId: string, webName: string): Promise<ProductData | null> {
    try {
        if (!storeId || !webName) {
            return null;
        }

        console.log("webName", webName);
        console.log("storeId", storeId);

        const querySpec = {
            query: "SELECT c.id, c.store_id, c.store_name, c.web_name, c.category, c.name, c.description, c.price, c.picture, c.ingredients, c.allergies, c.dietary, c.constId, c.additionalImages, c.variants, c.min_order, c.min_lead_time, c.hide_product, c.isPostDelivery FROM c WHERE c.store_id = @storeId AND (c.web_name = @webName OR c.id = @webName) AND c.archive = false",
            parameters: [
                { name: "@storeId", value: storeId },
                { name: "@webName", value: webName }
            ]
        };

        const { resources } = await containerProducts.items
            .query(querySpec, { partitionKey: storeId })
            .fetchAll();

        if (resources.length === 0) {
            return null;
        }

        const product = resources[0];
        
        // Get the like count for this product
        product.totalLikes = await getTotalFavoritesProduct(product.constId);
        
        return product;
    } catch (error) {
        console.error("Error fetching product by web name:", error);
        throw new Error("Failed to fetch product by web name");
    }
}

export async function getCurrentProduct(storeId: string, productId: string): Promise<ProductData | null> {
    try {
        if (!storeId) {
            return null;
        }

        const product = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/products/${productId}`, {
            headers: {
                'Store-Id': storeId,
                'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
            },
            next: {
                tags: ['products'],
                revalidate: 0
            }
        }).then(res => res.json());


        return product;
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

        const products = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/products`, {
            headers: {
                'Store-Id': storeId,
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

export async function getCurrentProductsByFilter(filterParams: {
  minPrice?: number;
  maxPrice?: number;
  categories?: string[];
  allergies?: string[];
  dietary?: string[];
}): Promise<ProductDataFull> {
  try {

    // Build the CosmosDB query
    let queryString = "SELECT c.id, c.store_id, c.store_name, c.web_name, c.category, c.name, c.description, c.price, c.picture, c.ingredients, c.allergies, c.dietary, c.constId, c.additionalImages, c.variants, c.min_order, c.min_lead_time, c.hide_product, c.isPostDelivery FROM c WHERE c.archive = false";
    const parameters: { name: string; value: any }[] = [
    ];

    // Add price filter
    if (filterParams.minPrice !== undefined) {
      queryString += " AND c.price >= @minPrice";
      parameters.push({ name: "@minPrice", value: filterParams.minPrice });
    }

    if (filterParams.maxPrice !== undefined) {
      queryString += " AND c.price <= @maxPrice";
      parameters.push({ name: "@maxPrice", value: filterParams.maxPrice });
    }

    // Add categories filter
    if (filterParams.categories && filterParams.categories.length > 0) {
      queryString += " AND c.category IN (";
      filterParams.categories.forEach((category, index) => {
        const paramName = `@category${index}`;
        queryString += index === 0 ? paramName : `, ${paramName}`;
        parameters.push({ name: paramName, value: category });
      });
      queryString += ")";
    }

    // For allergies and dietary, we need to handle arrays differently in CosmosDB
    // Exclude products that contain any of the selected allergies
    if (filterParams.allergies && filterParams.allergies.length > 0) {
      // Using NOT EXISTS to exclude products with matching allergies
      filterParams.allergies.forEach((allergy, index) => {
        const paramName = `@allergy${index}`;
        queryString += ` AND NOT EXISTS (SELECT VALUE a FROM a IN c.allergies WHERE a = ${paramName})`;
        parameters.push({ name: paramName, value: allergy });
      });
    }

    // Include only products that match dietary preferences
    if (filterParams.dietary && filterParams.dietary.length > 0) {
      // Using ARRAY_CONTAINS to match dietary preferences
      filterParams.dietary.forEach((diet, index) => {
        const paramName = `@diet${index}`;
        queryString += ` AND ARRAY_CONTAINS(c.dietary, ${paramName})`;
        parameters.push({ name: paramName, value: diet });
      });
    }

    const querySpec = {
      query: queryString,
      parameters: parameters
    };

    const { resources: products } = await containerProducts.items
      .query(querySpec)
      .fetchAll();


   

    const productDataFull: ProductDataFull = {};
    products.forEach((product: ProductData) => {
      // Assign the like count to each product, defaulting to 0 if not found
      productDataFull[product.id] = product;
    });

    return productDataFull;
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    throw new Error("Failed to fetch filtered products");
  }
}

// New function to fetch products across all stores based on filters, with pagination
export async function getAllProductsByFilter(filterParams: { 
  minPrice?: number; 
  maxPrice?: number; 
  categories?: string[]; 
  allergies?: string[]; 
  dietary?: string[];
}, page: number = 1, limit: number = 20, storeIds?: string[]): Promise<{ products: ProductData[], hasMore: boolean }> {
  try {
    const offset = (page - 1) * limit;

    // Build the CosmosDB query - no storeId filter
    let queryString = "SELECT c.id, c.store_id, c.store_name, c.web_name, c.category, c.name, c.description, c.price, c.picture, c.ingredients, c.allergies, c.dietary, c.constId, c.additionalImages, c.variants, c.min_order, c.min_lead_time, c.hide_product FROM c WHERE c.archive = false";
    const parameters: { name: string; value: any }[] = [];

    // Add price filter
    if (filterParams.minPrice !== undefined) {
      queryString += " AND c.price >= @minPrice";
      parameters.push({ name: "@minPrice", value: filterParams.minPrice });
    }

    if (filterParams.maxPrice !== undefined) {
      queryString += " AND c.price <= @maxPrice";
      parameters.push({ name: "@maxPrice", value: filterParams.maxPrice });
    }

    // Add categories filter
    if (filterParams.categories && filterParams.categories.length > 0) {
      queryString += " AND c.category IN (";
      filterParams.categories.forEach((category, index) => {
        const paramName = `@category${index}`;
        queryString += index === 0 ? paramName : `, ${paramName}`;
        parameters.push({ name: paramName, value: category });
      });
      queryString += ")";
    }

    // For allergies and dietary, we need to handle arrays differently in CosmosDB
    // Exclude products that contain any of the selected allergies
    if (filterParams.allergies && filterParams.allergies.length > 0) {
      // Using NOT EXISTS to exclude products with matching allergies
      filterParams.allergies.forEach((allergy, index) => {
        const paramName = `@allergy${index}`;
        queryString += ` AND NOT EXISTS (SELECT VALUE a FROM a IN c.allergies WHERE a = ${paramName})`;
        parameters.push({ name: paramName, value: allergy });
      });
    }

    // Include only products that match dietary preferences
    if (filterParams.dietary && filterParams.dietary.length > 0) {
      // Using ARRAY_CONTAINS to match dietary preferences
      filterParams.dietary.forEach((diet, index) => {
        const paramName = `@diet${index}`;
        queryString += ` AND ARRAY_CONTAINS(c.dietary, ${paramName})`;
        parameters.push({ name: paramName, value: diet });
      });
    }
    
    // Add store IDs filter
    if (storeIds && storeIds.length > 0) {
      queryString += " AND c.store_id IN (";
      storeIds.forEach((storeId, index) => {
        const paramName = `@storeId${index}`;
        queryString += index === 0 ? paramName : `, ${paramName}`;
        parameters.push({ name: paramName, value: storeId });
      });
      queryString += ")";
    }

    // Add pagination
    queryString += " OFFSET @offset LIMIT @limit";
    parameters.push({ name: "@offset", value: offset });
    parameters.push({ name: "@limit", value: limit + 1 }); // Fetch one extra item to check if there are more pages

    const querySpec = {
      query: queryString,
      parameters: parameters
    };

    // Query without partition key as we search across all stores
    const { resources: fetchedProducts } = await containerProducts.items
      .query(querySpec)
      .fetchAll();

    // Check if there are more products to fetch
    const hasMore = fetchedProducts.length > limit;
    // Remove the extra item if it exists
    const products = hasMore ? fetchedProducts.slice(0, limit) : fetchedProducts;

    // Note: This fetches likes for *all* products, which might be inefficient.
    // Consider optimizing this later if needed (e.g., fetch likes only for displayed products).
    // const productConstIds = products.map(p => p.constId);
    // const productFavoriteCounts = await getProductFavoritesCountsByConstIds(productConstIds); // Assuming such a function exists

    const productDataFull: ProductData[] = products.map((product: any) => {
      // Assign like count (placeholder 0 for now to avoid extra queries here)
      product.totalLikes = 0; // productFavoriteCounts[product.constId] || 0;
      return product;
    });

    return { products: productDataFull, hasMore };
  } catch (error) {
    console.error("Error fetching all filtered products:", error);
    // In case of error, return empty results
    return { products: [], hasMore: false };
  }
}

export type ProductData = {
    id: string;
    store_id: string;
    category: string;
    name: string;
    web_name: string;
    store_name?: string;
    min_order: number;
    min_lead_time: number;
    description?: string | null;
    variants?: ProductVariant[];
    price: number;
    picture: string;
    ingredients?: string[];
    allergies?: string[];
    dietary?: string[];
    constId: string;
    additionalImages: string[];
    hide_product?: boolean;
    isPostDelivery?: boolean;
    totalLikes: number;
};

export type ProductDataClean = {
    store_id: string;
    category: string;
    name?: string;
    web_name?: string;
    store_name?: string;
    min_order: number;
    min_lead_time: number;
    description?: string | null;
    variants?: ProductVariant[];
    price: number;
    picture?: string;
    ingredients?: string[];
    allergies?: string[];
    dietary?: string[];
    id?: string;
    constId?: string;
    additionalImages?: string[];
    hide_product?: boolean;
    isPostDelivery?: boolean;
};

export type ProductVariant = {
    label: string;
    isSingle: boolean;
    required: boolean;
    minSelections?: number;
    maxSelections?: number;
    options: {
        label: string;
        price: number;
    }[];
}

export type ProductDataFull = {
    [productId: string]: ProductData;
};