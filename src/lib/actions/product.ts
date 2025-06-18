'use server';
import * as z from "zod";
import {ProductSchema} from "@/lib/utils/schemas";
import {getCurrentSession} from "@/lib/actions/session";
import {globalPOSTRateLimit} from "@/lib/utils/helper/requests";
import {v4 as uuidv4} from "uuid";
import {containerProducts, containerCart} from "@/db";
import {revalidateTag} from "next/cache";
import { getTranslations } from "next-intl/server";
import { getCartItemsByProductId } from "@/lib/actions/cart";
import {getCurrentStoreByUserIdAndStoreId} from "@/lib/api/store-api";
import { getTotalFavoritesProduct,getProductFavoritesCountsByStore } from "./favorites";

type TranslationFunction = (key: string, params?: Record<string, string | number>) => string;

/**
 * Represents a product variant with customizable options.
 */
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

/**
 * Core product data structure used throughout the application.
 */
export type ProductData = {
    id: string;
    store_id: string;
    category: string;
    name: string;
    min_order: number;
    min_lead_time: number;
    description?: string | null;
    variants?: ProductVariant[];
    price: number;
    picture: string;
    ingredients?: string[];
    allergies?: string[];
    dietary?: string[];
    additionalImages: string[];
    hide_product?: boolean;
    isPostDelivery?: boolean;
    totalLikes: number;
};

/**
 * Database fields to select when querying products.
 */
const PRODUCT_FIELDS = [
    'c.id',
    'c.store_id',
    'c.category',
    'c.name',
    'c.min_order',
    'c.min_lead_time',
    'c.description',
    'c.variants',
    'c.price',
    'c.picture',
    'c.ingredients',
    'c.allergies',
    'c.dietary',
    'c.additionalImages',
    'c.hide_product',
    'c.isPostDelivery'
] as const;

/**
 * Extended product data structure including database metadata.
 */
export interface ProductDataDB extends ProductData {
    archive: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Clean product data structure for form inputs and updates.
 */
export type ProductDataClean = {
    id?: string;
    store_id: string;
    category: string;
    name?: string;
    min_order: number;
    min_lead_time: number;
    description?: string | null;
    variants?: ProductVariant[];
    price: number;
    picture?: string;
    ingredients?: string[];
    allergies?: string[];
    dietary?: string[];
    additionalImages?: string[];
    hide_product?: boolean;
    isPostDelivery?: boolean;
};

/**
 * Dictionary structure for storing multiple products indexed by product ID.
 */
export type ProductDataFull = {
    [productId: string]: ProductData;
};

/**
 * Retrieves a complete product database record including metadata fields.
 * This is different from getProductByStoreIdAndProductId which only returns public fields.
 *
 * @param {string} storeId - The store ID (partition key)
 * @param {string} productId - The product ID
 * @returns {Promise<ProductDataDB | null>} Complete database record or null if not found
 */
async function getProductDBRecord(storeId: string, productId: string): Promise<ProductDataDB | null> {
    try {
        const { resource } = await containerProducts.item(productId, storeId).read();
        return resource || null;
    } catch (error: any) {
        if (error.code === 404) {
            return null;
        }
        throw error;
    }
}

/**
 * Adds a new product or updates an existing one in the database.
 *
 * This function handles the complete product creation/update workflow including:
 * - Form validation using Zod schema
 * - User authentication and authorization
 * - Store ownership verification
 * - Product data persistence to Cosmos DB
 * - Cache invalidation for updated data
 *
 * @param {z.infer<typeof ProductSchema>} formData - The validated product form data
 * @param {string} storeId - The ID of the store where the product belongs
 * @param {string} [productId] - Optional product ID for updates. If omitted, creates a new product
 * @returns {Promise<{ success?: string; error?: string; product?: object }>} Operation result with success/error message and product data
 * 
 * @example
 * ```typescript
 * const result = await addProduct(formData, "store123", "product456");
 * if (result.success) {
 *   console.log("Product updated:", result.product);
 * } else {
 *   console.error("Error:", result.error);
 * }
 * ```
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
        oldProductData = await getProductDBRecord(store.id, productId);
        if (!oldProductData) return { error: t("productNotFound") };
    }


    const now = new Date().toISOString();
    const productData: ProductDataDB = {
        id: oldProductData ? oldProductData.id : uuidv4(),
        store_id: store.id,
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
        additionalImages: formData.additionalImages || [],
        hide_product: formData.hide_product,
        isPostDelivery: formData.isPostDelivery,
        archive: false,
        totalLikes: oldProductData ? oldProductData.totalLikes : 0,
        createdAt: oldProductData ? oldProductData.createdAt : now,
        updatedAt: now,
    };

    try {
        if (productId) {
            // Update existing product
            await containerProducts.item(productId, store.id).replace(productData);
            revalidateTag("products");
            return { success: t("productUpdated"), product: productData };
        } else {
            // Create new product
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
 * Soft deletes a product by setting its archive status to true.
 *
 * This function performs a soft delete operation that:
 * - Validates user authentication and store ownership
 * - Archives the product instead of permanently deleting it
 * - Removes all associated cart items across all users
 * - Invalidates relevant caches for immediate UI updates
 *
 * @param {string} productId - The unique identifier of the product to delete
 * @param {string} storeId - The store ID that owns the product (used as partition key)
 * @returns {Promise<{ success?: string; error?: string }>} Operation result with success or error message
 * 
 * @example
 * ```typescript
 * const result = await deleteProduct("product123", "store456");
 * if (result.success) {
 *   console.log("Product archived successfully");
 * } else {
 *   console.error("Deletion failed:", result.error);
 * }
 * ```
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

/**
 * Retrieves all active products for a specific store.
 *
 * This function fetches all non-archived products belonging to a store and enriches
 * them with their favorite/like counts. The results are returned as a dictionary
 * indexed by product ID for efficient lookups.
 *
 * @param {string} storeId - The unique identifier of the store
 * @returns {Promise<ProductDataFull>} Dictionary of products indexed by product ID, or empty object if store not found
 * 
 * @throws {Error} Throws an error if the database query fails
 * 
 * @example
 * ```typescript
 * try {
 *   const products = await getProductsByStoreId("store123");
 *   console.log(`Found ${Object.keys(products).length} products`);
 *   
 *   // Access specific product
 *   const product = products["product456"];
 *   if (product) {
 *     (`Product: ${product.name}, Likes: ${product.totalLikes}`);
 *   }
 * } catch (error) {
 *   console.error("Failed to fetch products:", error);
 * }
 * ```
 */
export async function getProductsByStoreId(storeId: string): Promise<ProductDataFull> {
    try {

        if (!storeId) {
            return {};
        }

        const querySpec = {
            query: `SELECT ${PRODUCT_FIELDS.join(', ')} FROM c WHERE c.store_id = @storeId AND c.archive=false`,
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
            product.totalLikes = productFavoriteCounts[product.id] || 0;
            productDataFull[product.id] = product;
        });

        return productDataFull;
    } catch (error) {
        console.error("Error fetching store products:", error);
        throw new Error("Failed to fetch store products");
    }
}

/**
 * Retrieves a specific product by store ID and product ID.
 *
 * This function fetches a single product that is active (not archived) and visible
 * (not hidden) from a specific store. It also enriches the product data with
 * its current favorite/like count.
 *
 * @param {string} storeId - The unique identifier of the store
 * @param {string} productId - The unique identifier of the product
 * @returns {Promise<ProductData | null>} The product data with like count, or null if not found
 * 
 * @throws {Error} Throws an error if the database query fails
 * 
 * @example
 * ```typescript
 * try {
 *   const product = await getProductByStoreIdAndProductId("store123", "product456");
 *   if (product) {
 *     console.log(`Found product: ${product.name}`);
 *     console.log(`Price: $${product.price}, Likes: ${product.totalLikes}`);
 *   } else {
 *     console.log("Product not found or not available");
 *   }
 * } catch (error) {
 *   console.error("Failed to fetch product:", error);
 * }
 * ```
 */
export async function getProductByStoreIdAndProductId(storeId: string, productId: string): Promise<ProductData | null> {
    try {
        if (!storeId || !productId) {
            return null;
        }

        const querySpec = {
            query: `SELECT ${PRODUCT_FIELDS.join(', ')} FROM c WHERE c.store_id = @storeId AND c.id = @productId AND c.archive = false AND (c.hide_product = false OR NOT IS_DEFINED(c.hide_product))`,
            parameters: [
                { name: "@storeId", value: storeId },
                { name: "@productId", value: productId }
            ]
        };

        const { resources } = await containerProducts.items
            .query(querySpec, { partitionKey: storeId })
            .fetchAll();

        if (resources.length === 0) {
            return null;
        }

        const product: ProductData = resources[0];
        
        // Get the like count for this product
        product.totalLikes = await getTotalFavoritesProduct(product.id);
        
        return product;
    } catch (error) {
        console.error("Error fetching product by web name:", error);
        throw new Error("Failed to fetch product by web name");
    }
}

/**
 * Retrieves products across multiple stores with advanced filtering and pagination.
 *
 * This function performs a cross-store product search with support for:
 * - Price range filtering (min/max price)
 * - Category filtering (multiple categories)
 * - Allergy exclusion (excludes products containing specified allergens)
 * - Dietary preference matching (includes only products matching dietary requirements)
 * - Store-specific filtering (optional store ID restrictions)
 * - Pagination with configurable page size
 *
 * @param {Object} filterParams - The filtering criteria
 * @param {number} [filterParams.minPrice] - Minimum price filter (inclusive)
 * @param {number} [filterParams.maxPrice] - Maximum price filter (inclusive)
 * @param {string[]} [filterParams.categories] - Array of category names to include
 * @param {string[]} [filterParams.allergies] - Array of allergens to exclude from results
 * @param {string[]} [filterParams.dietary] - Array of dietary preferences that products must match
 * @param {number} [page=1] - Page number for pagination (1-based)
 * @param {number} [limit=20] - Number of products per page
 * @param {string[]} [storeIds] - Optional array of store IDs to limit search scope
 * @returns {Promise<{ products: ProductData[], hasMore: boolean }>} Paginated products with hasMore flag
 * 
 * @example
 * ```typescript
 * // Search for vegan products under $20, excluding nuts, page 1
 * const result = await getAllProductsByFilter({
 *   maxPrice: 20,
 *   dietary: ["vegan"],
 *   allergies: ["nuts"]
 * }, 1, 10);
 * 
 * console.log(`Found ${result.products.length} products`);
 * if (result.hasMore) {
 *   console.log("More products available on next page");
 * }
 * 
 * // Search in specific stores only
 * const storeSpecificResult = await getAllProductsByFilter({
 *   categories: ["bakery", "desserts"]
 * }, 1, 20, ["store1", "store2"]);
 * ```
 */
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
    let queryString = `SELECT ${PRODUCT_FIELDS.join(', ')} FROM c WHERE c.archive = false AND (c.hide_product = false OR NOT IS_DEFINED(c.hide_product))`;
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

    // console.log("querySpec", querySpec);

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