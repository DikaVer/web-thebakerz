'use server';
import {globalGETRateLimit, globalPOSTRateLimit} from "@/lib/actions/requests";
import {getCartSessionCookie, getCartSessionCookieOrCreate, getCurrentSession} from "@/lib/actions/session";
import { v4 as uuidv4 } from "uuid";
import {containerCart, containerProducts} from "@/db";
import {revalidateTag} from "next/cache";
import {ProductData} from "@/lib/actions/product";

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
    try {
        if (!(await globalPOSTRateLimit())) {
            return { error: "Too many requests" };
        }

        // check note length
        if (note && note.length > 100) {
            return { error: "Note is too long!" };
        }

        // Get the product data to validate variants
        const { resource: productData } = await containerProducts.item(productId, storeId).read<ProductData>();

        // Validate variants against product configuration
        if (productData?.variants && productData.variants.length > 0) {
            const variantsError = validateVariants(variants || [], productData.variants);
            if (variantsError) {
                return { error: variantsError };
            }
        }

        const session = await getCurrentSession();
        let userId;
        if (!session || !session.user) {
            userId = await getCartSessionCookieOrCreate();
        } else {
            userId = session.user.id;
        }
        if (!userId) return { error: "User not found!" };


        // If your container uses a composite partition key with /store_id and /user_id,
        // use an array: [storeId, userId]
        const partitionKeyValue = [storeId, userId];
        const now = new Date().toISOString();
        const newItemCart: ItemCart = {
            id: itemId || uuidv4(),
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

        // console.log(newItemCart);
        revalidateTag('cart');
        return { success: "Cart updated successfully!", itemCart: newItemCart };
    } catch (error: any) {
        console.error("Error updating cart:", error);
        return { error: "Failed to update cart." };
    }
};


// Helper function to validate variants against product configuration
function validateVariants(
    submittedVariants: Variant[],
    productVariants: ProductData["variants"]
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
            return `${productVariant.label} is required`;
        }

        // If variant was submitted, validate it
        if (submittedVariant) {
            const selectedCount = submittedVariant.selectedItems.length;

            // Validate single selection has exactly one item
            if (productVariant.isSingle && selectedCount !== 1) {
                return `${productVariant.label} must have exactly one selection`;
            }

            // Validate multiple selection doesn't exceed max
            if (!productVariant.isSingle && productVariant.maxSelections && selectedCount > productVariant.maxSelections) {
                return `${productVariant.label} cannot have more than ${productVariant.maxSelections} selections`;
            }
            // console.log(productVariant )
            // console.log(submittedVariant)

            // Validate minimum selections if specified
            if (!productVariant.isSingle && productVariant.required  && productVariant.maxSelections && selectedCount !== productVariant.maxSelections) {
                return `${productVariant.label} must have ${productVariant.maxSelections} selections`;
            }

            // Validate that all selected items exist in the product options
            const validOptions = new Set(productVariant.options.map(opt => opt.label));
            for (const item of submittedVariant.selectedItems) {
                if (!validOptions.has(item.label)) {
                    return `Invalid option ${item.label} for ${productVariant.label}`;
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
    try {
        if (!(await globalPOSTRateLimit())) {
            return { error: "Too many requests" };
        }
        const session = await getCurrentSession();
        let userId;
        if (!session || !session.user) {
            userId = await getCartSessionCookieOrCreate();
        } else {
            userId = session.user.id;
        }
        if (!userId) return { error: "User not found!" };

        const partitionKeyValue = [storeId, userId];
        await containerCart.item(itemId, partitionKeyValue).delete();
        revalidateTag('cart');
        return { success: "Item removed successfully!" };
    } catch (error: any) {
        console.error("Error removing cart item:", error);
        return { error: "Failed to remove cart item." };
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
    try {
        if (!(await globalGETRateLimit())) {
            return { error: "Too many requests" };
        }

        const session = await getCurrentSession();

        if (!session || !session.user) {
            return { error: "Session is not recognized" };
        }


        const userId = session.user.id;
        const guestId = await getCartSessionCookie();



        // Assuming your container is partitioned with a composite key on /store_id and /user_id,
        // you must supply the partition key as an array: [storeId, guestId]
        const guestPartitionKey = [storeId, guestId];
        const userPartitionKey = [storeId, userId];

        // Query for all cart items for this guest.
        const querySpec = {
            query: "SELECT * FROM c WHERE c.store_id = @storeId AND c.user_id = @guestId",
            parameters: [
                { name: "@storeId", value: storeId },
                { name: "@guestId", value: guestId },
            ],
        };


        const { resources: guestItems } = await containerCart.items
            .query(querySpec, { partitionKey: guestPartitionKey })
            .fetchAll();


        // Query for existing user cart items.
        const userQuerySpec = {
            query: "SELECT * FROM c WHERE c.store_id = @storeId AND c.user_id = @userId",
            parameters: [
                { name: "@storeId", value: storeId },
                { name: "@userId", value: userId },
            ],
        };

        const { resources: userItems } = await containerCart.items
            .query(userQuerySpec, { partitionKey: userPartitionKey })
            .fetchAll();

        // Delete all existing user items concurrently.
        if (userItems && userItems.length > 0) {
            await Promise.all(
                userItems.map((item) =>
                    containerCart.item(item.id, userPartitionKey).delete()
                )
            );
        }

        // Process each guest cart item concurrently.
        if (guestItems && guestItems.length > 0) {
            await Promise.all(
                guestItems.map(async (item) => {
                    // Create a new item with the updated user id.
                    const newItem: ItemCart = {
                        ...item,
                        // Retain the same id (or generate a new one if desired).
                        id: item.id,
                        user_id: userId,
                    };

                    // Insert the new document into the user partition.
                    await containerCart.items.create(newItem);

                    // Delete the original guest document.
                    await containerCart.item(item.id, guestPartitionKey).delete();
                })
            );
        }
        revalidateTag('cart');

        return {
            success: "Guest cart replaced successfully with user cart items!",
        };
    } catch (error: any) {
        console.error("Error replacing guest cart:", error);
        return { error: "Failed to replace guest cart." };
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
    try {
        if (!(await globalPOSTRateLimit())) {
            return { error: "Too many requests" };
        }

        if (!userId || !storeId) {
            return { error: "User ID and Store ID are required" };
        }

        // Get current cart before deletion
        const cartData = await getCart(userId, storeId);

        // Define the partition key value
        const partitionKeyValue = [storeId, userId];

        // Check if there are items in the cart and delete them sequentially
        if (cartData[storeId]) {
            const cartItems = Object.values(cartData[storeId]);
            if (cartItems.length > 0) {
                for (const item of cartItems) {
                    await containerCart.item(item.id, partitionKeyValue).delete();
                }
            }
        }

        revalidateTag('cart');

        return {
            success: "Cart removed successfully!"
        };
    } catch (error: any) {
        console.error("Error removing cart:", error);
        return { error: "Failed to remove cart." };
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
        query: "SELECT * FROM c WHERE c.store_id = @storeId AND c.user_id = @userId",
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

