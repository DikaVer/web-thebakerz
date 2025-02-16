'use server';
import {globalPOSTRateLimit} from "@/lib/actions/requests";
import {getCartSessionCookie, getCurrentSession} from "@/lib/actions/session";
import {v4 as uuidv4} from "uuid";
import {cookies} from "next/headers";
import {containerCart} from "@/db";


export interface CartData {
    [store_id: string]: CartItem;
}

export interface CartItem {
    [item_id: string]: ItemCart;
}

export interface ItemCart {
    id: string;
    store_id: string;
    product_id: string;
    note: string;
    quantity: number;
    createdAt: string;
    expiredAt: string;
    user_id: string;
}

/**
 * Updates or adds a product to the cart in Cosmos DB.
 * The partition key is a synthetic key combining store_id, user_id, and the cart item id.
 *
 * @param productId - The product's ID.
 * @param storeId - The store's ID.
 * @param note
 * @param quantity
 * @param itemId
 *                   If not provided, a new cart item will be created.
 * @returns An object indicating success or error.
 */
export const updateCart = async (
    productId: string,
    storeId: string,
    note: string,
    quantity: number,
    itemId?: string
): Promise<{ success?: string; error?: string; itemCart?: ItemCart }> => {
    try {

        if (!await globalPOSTRateLimit()){
            return {
                error: "Too many requests"
            }
        }

        // Get the current session (user id from session or cookie).
        const session = await getCurrentSession();

        let userId;
        if (!session || !session.user) {
            userId = await getCartSessionCookie();
        } else {
            userId = session.user.id;
        }

        if (!userId) {
            return { error: "User not found!" };
        }

        // Determine the cart item id.
        // If updating an existing cart item, use its id; otherwise generate a new one.

        const cartKey = `${storeId}_${userId}`;

        const now = new Date().toISOString();
        const newItemCart: ItemCart = {
            id: itemId || uuidv4(),
            store_id: storeId,
            product_id: productId,
            note: note,
            quantity: quantity,
            createdAt: now,
            expiredAt: now, // adjust expiration logic as needed
            user_id: userId,
        };

        // Upsert (insert or update) the cart item document.
        // Since the container is partitioned on /cartKey, passing that ensures proper placement.
        if (itemId){
            await containerCart.item(itemId, cartKey).patch({
                operations: [
                    { op: "set", path: "/note", value: newItemCart.note },
                    { op: "set", path: "/quantity", value: newItemCart.quantity },
                    // add other operations as needed
                ],
            });
        } else {
            await containerCart.items.create(newItemCart);
        }

        return { success: "Cart updated successfully!", itemCart: newItemCart };
    } catch (error: any) {
        console.error("Error updating cart:", error);
        return { error: "Failed to update cart." };
    }
};

/**
 * Retrieves the full cart for a given store and user.
 *
 * @param storeId - The store's ID.
 * @returns A Promise that resolves to a CartData object.
 */
export const getCart = async (
    storeId: string
): Promise<CartData> => {

    const session = await getCurrentSession();
    let userId;
    if (!session || !session.user) {
        userId = await getCartSessionCookie();
    } else {
        userId = session.user.id;
    }

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