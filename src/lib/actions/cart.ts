'use server';
import {globalGETRateLimit, globalPOSTRateLimit} from "@/lib/actions/requests";
import {getCartSessionCookie, getCartSessionCookieOrCreate, getCurrentSession} from "@/lib/actions/session";
import { v4 as uuidv4 } from "uuid";
import {containerCart, containerProducts} from "@/db";
import {revalidateTag} from "next/cache";
import {ProductData} from "@/lib/actions/product";
import { getTranslations } from "next-intl/server";
import { getRequestContext } from "@/lib/request-context";

type TranslationFunction = (key: string, params?: Record<string, string | number>) => string;

export interface CartData {
    [store_id: string]: CartItem;
}

export interface CartItem {
    [item_id: string]: ItemCart;
}

// export interface Variants {
//     label: string;
//     isSingle: boolean;
//     required: boolean;
//
// }[]

export interface Variant {
    label: string;
    selectedItems: {
        label: string;
        price: number;
    }[];
}


export interface ItemCart {
    id: string;
    store_id: string;
    product_id: string;
    note?: string;
    variants?: Variant[];
    quantity: number;
    createdAt: string;
    user_id: string;
}

/**
 * Updates or adds a product to the cart in Cosmos DB.
 */
export const updateCart = async (
    productId: string,
    storeId: string,
    quantity: number,
    note?: string,
    variants?: Variant[],
    itemId?: string
): Promise<{ success?: string; error?: string; itemCart?: ItemCart }> => {
    const t = await getTranslations("app/lib/actions/cart") as TranslationFunction;
    const context = await getRequestContext();
    
    try {
        if (!(await globalPOSTRateLimit())) {
            return { error: t("tooManyRequests") };
        }

        if (note && note.length > 100) {
            return { error: t("noteTooLong") };
        }
        
        const { resource: productData } = await containerProducts.item(productId, storeId).read<ProductData>();

        if (!productData) {
            return { error: t("productNotFound") };
        }

        if (productData?.variants && productData.variants.length > 0) {
            
            const variantsError = validateVariants(variants || [], productData.variants, t);
            if (variantsError) {
                return { error: variantsError };
            }
        }

        const minOrder = productData?.min_order || 1;

        if (quantity < minOrder) {
            return { error: t("minOrderRequired", { min: minOrder }) };
        }

        const session = await getCurrentSession();
        let userId;
        if (!session || !session.user) {
            userId = await getCartSessionCookieOrCreate();
        } else {
            userId = session.user.id;
        }
        
        if (!userId) {
            return { error: t("userNotFound") };
        }

        const partitionKeyValue = [storeId, userId];
        const now = new Date().toISOString();
        const cartItemId = itemId || uuidv4();
        
        const newItemCart: ItemCart = {
            id: cartItemId,
            store_id: storeId,
            product_id: productId,
            note,
            quantity,
            variants,
            createdAt: now,
            user_id: userId,
        };

        if (itemId) {
            await containerCart.item(itemId, partitionKeyValue).patch({
                operations: [
                    { op: "set", path: "/note", value: newItemCart.note },
                    { op: "set", path: "/quantity", value: newItemCart.quantity },
                    { op: "set", path: "/variants", value: newItemCart.variants }
                ],
            });
        } else {
            await containerCart.items.create(newItemCart);
        }

        revalidateTag('cart');
        
        
        return { success: t("cartUpdatedSuccess"), itemCart: newItemCart };
    } catch (error: any) {
        console.error("Error updating cart:", error);
        return { error: t("failedUpdateCart") };
    }
};


// Helper function to validate variants against product configuration
function validateVariants(
    submittedVariants: Variant[],
    productVariants: ProductData["variants"],
    t: TranslationFunction
): string | null {
    // Create a map of submitted variants for easier lookup
    const submittedVariantsMap = new Map<string, Variant>();
    submittedVariants.forEach(variant => {
        submittedVariantsMap.set(variant.label, variant);
    });


    // Check each product variant configuration
    for (const productVariant of productVariants || []) {
        const submittedVariant = submittedVariantsMap.get(productVariant.label);

        // Check if required variant is missing
        if (productVariant.required && (!submittedVariant || submittedVariant.selectedItems.length === 0)) {
            return t("requiredVariantMissing", { variant: productVariant.label });
        }

        // If variant was submitted, validate it
        if (submittedVariant) {
            const selectedCount = submittedVariant.selectedItems.length;

            // Validate single selection has exactly one item
            if (productVariant.isSingle && selectedCount !== 1) {
                return t("singleSelectionRequired", { variant: productVariant.label });
            }

            // Validate multiple selection doesn't exceed max
            if (!productVariant.isSingle && productVariant.maxSelections && selectedCount > productVariant.maxSelections) {
                return t("maxSelectionsExceeded", { variant: productVariant.label, max: productVariant.maxSelections });
            }

            // Validate minimum selections if specified
            if (!productVariant.isSingle && productVariant.required  && productVariant.maxSelections && selectedCount !== productVariant.maxSelections) {
                return t("minSelectionsRequired", { variant: productVariant.label, min: productVariant.maxSelections });
            }

            // Validate that all selected items exist in the product options
            const validOptions = new Set(productVariant.options.map(opt => opt.label));
            for (const item of submittedVariant.selectedItems) {
                if (!validOptions.has(item.label)) {
                    return t("invalidOption", { option: item.label, variant: productVariant.label });
                }
            }
        }
    }

    return null; // No validation errors
}

/**
 * Removes a product from the cart in Cosmos DB.
 */
export const removeCartItem = async (
    storeId: string,
    itemId: string
): Promise<{ success?: string; error?: string }> => {
    const t = await getTranslations("app/lib/actions/cart") as TranslationFunction;
    
    try {
        if (!(await globalPOSTRateLimit())) {
            return { error: t("tooManyRequests") };
        }
        const session = await getCurrentSession();
        let userId;
        if (!session || !session.user) {
            userId = await getCartSessionCookieOrCreate();
        } else {
            userId = session.user.id;
        }
        if (!userId) return { error: t("userNotFound") };

        const partitionKeyValue = [storeId, userId];
        await containerCart.item(itemId, partitionKeyValue).delete();
        revalidateTag('cart');
        return { success: t("itemRemovedSuccess") };
    } catch (error: any) {
        console.error("Error removing cart item:", error);
        return { error: t("failedRemoveItem") };
    }
};

/**
 * Replace guest cart items with the logged-in user's cart items.
 * This function queries all documents for the guest (guestId) and, for each one,
 * creates a new document with user_id set to userId, then deletes the guest document.
 *
 * @param storeId - The store's ID.
 * @returns An object indicating success or error.
 */
export const replaceGuestCart = async (
    storeId: string
): Promise<{ success?: string; error?: string }> => {
    const t = await getTranslations("app/lib/actions/cart") as TranslationFunction;
    
    try {
        if (!(await globalGETRateLimit())) {
            return { error: t("tooManyRequests") };
        }

        const session = await getCurrentSession();

        if (!session || !session.user) {
            return { error: t("sessionNotRecognized") };
        }

        const userId = session.user.id;
        const guestId = await getCartSessionCookie();

        const guestPartitionKey = [storeId, guestId];
        const userPartitionKey = [storeId, userId];

        const querySpec = {
            query: "SELECT c.id, c.store_id, c.product_id, c.note, c.quantity, c.variants, c.createdAt, c.user_id FROM c WHERE c.store_id = @storeId AND c.user_id = @guestId",
            parameters: [
                { name: "@storeId", value: storeId },
                { name: "@guestId", value: guestId },
            ],
        };

        const { resources: guestItems } = await containerCart.items
            .query(querySpec, { partitionKey: guestPartitionKey })
            .fetchAll();

        const userQuerySpec = {
            query: "SELECT c.id, c.store_id, c.product_id, c.note, c.quantity, c.variants, c.createdAt, c.user_id FROM c WHERE c.store_id = @storeId AND c.user_id = @userId",
            parameters: [
                { name: "@storeId", value: storeId },
                { name: "@userId", value: userId },
            ],
        };

        const { resources: userItems } = await containerCart.items
            .query(userQuerySpec, { partitionKey: userPartitionKey })
            .fetchAll();

        const operations = [];

        // Add user items deletion to operations
        if (userItems && userItems.length > 0) {
            operations.push(
                ...userItems.map((item) =>
                    containerCart.item(item.id, userPartitionKey).delete()
                )
            );
        }

        // Add guest items replacement to operations
        if (guestItems && guestItems.length > 0) {
            operations.push(
                ...guestItems.map(async (item) => {
                    const newItem: ItemCart = {
                        ...item,
                        id: item.id,
                        user_id: userId,
                    };
                    return Promise.all([
                        containerCart.items.create(newItem),
                        containerCart.item(item.id, guestPartitionKey).delete()
                    ]);
                })
            );
        }

        // Execute all operations in parallel
        if (operations.length > 0) {
            await Promise.all(operations);
        }

        revalidateTag('cart');

        return {
            success: t("guestCartReplacedSuccess")
        };
    } catch (error: any) {
        console.error("Error replacing guest cart:", error);
        return { error: t("failedReplaceGuestCart") };
    }
}

/**
 * Removes all items in a user's cart for a specific store and returns the cart data before removal.
 *
 * @param userId - The user's ID.
 * @param storeId - The store's ID.
 * @returns A Promise that resolves to the removed CartData object.
 */
export const removeCartByUserIdAndStoreId = async (
    userId: string,
    storeId: string
): Promise<{ cartData?: CartData; success?: string; error?: string }> => {
    const t = await getTranslations("app/lib/actions/cart") as TranslationFunction;
    
    try {
        if (!(await globalPOSTRateLimit())) {
            return { error: t("tooManyRequests") };
        }

        if (!userId || !storeId) {
            return { error: t("userIdStoreIdRequired") };
        }

        const cartData = await getCart(userId, storeId);
        const partitionKeyValue = [storeId, userId];

        if (cartData[storeId]) {
            const cartItems = Object.values(cartData[storeId]);
            if (cartItems.length > 0) {
                await Promise.all(
                    cartItems.map(async (item) => {
                        await containerCart.item(item.id, partitionKeyValue).delete();
                    })
                );
            }
        }

        revalidateTag('cart');

        return {
            success: t("cartRemovedSuccess")
        };
    } catch (error: any) {
        console.error("Error removing cart:", error);
        return { error: t("failedRemoveCart") };
    }
};


/**
 * Retrieves the full cart for a given store and user.
 *
 * @param userId
 * @param storeId - The store's ID.
 * @returns A Promise that resolves to a CartData object.
 */
export const getCart = async (
    userId: string,
    storeId: string
): Promise<CartData> => {

    const querySpec = {
        query: "SELECT c.id, c.store_id, c.product_id, c.note, c.quantity, c.variants, c.createdAt, c.user_id FROM c WHERE c.store_id = @storeId AND c.user_id = @userId",
        parameters: [{ name: "@storeId", value: storeId }, { name: "@userId", value: userId }],
    };

    const partitionKeyValue = [storeId, userId];

    // Query using the partition key.
    const { resources: items } = await containerCart.items
        .query(querySpec, { partitionKey: partitionKeyValue })
        .fetchAll();

    // Build a CartItem object where each key is an item id.
    const cartItems: CartItem = {};
    items.forEach((item: ItemCart) => {
        cartItems[item.id] = item;
    });

    // Return the CartData object, keyed by store_id.
    return { [storeId]: cartItems };
};

export const getCurrentCart = async (
    storeId: string
): Promise<CartData> => {

    const session = await getCurrentSession();
    let userId;
    if (!session || !session.user) {
        userId = await getCartSessionCookie();
    } else {
        userId = session.user.id;
    }


    if (!userId) return {};

    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/cart`, {
        headers: {
            'Store-Id': storeId,
            'User-Id': userId,
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
        },
        next: {
            tags: ['cart'],
            revalidate: 300
        }
    }).then(res => res.json());

};

/**
 * Gets all cart items for a specific product in a store.
 * 
 * @param storeId - The store's ID.
 * @param productId - The product's ID.
 * @returns A Promise that resolves to an array of cart items.
 */
export const getCartItemsByProductId = async (
    storeId: string,
    productId: string
): Promise<ItemCart[]> => {
    try {
        const querySpec = {
            query: "SELECT c.id, c.store_id, c.product_id, c.note, c.quantity, c.variants, c.createdAt, c.user_id FROM c WHERE c.store_id = @storeId AND c.product_id = @productId",
            parameters: [
                { name: "@storeId", value: storeId },
                { name: "@productId", value: productId }
            ],
        };

        const { resources: items } = await containerCart.items
            .query(querySpec)
            .fetchAll();

        return items;
    } catch (error) {
        console.error("Error fetching cart items by product:", error);
        return [];
    }
};

