import 'server-only';
import {sql} from "@vercel/postgres";
import {CartProductDataField, ProductDataField, StoreDataField} from "@/lib/definitions";
import React from "react";

export const config = {
    runtime: 'edge', // 'nodejs' is the default
};

export async function getStore(id: string) {

    const storeQuery = await sql<StoreDataField>`
        SELECT store_id, description, location, avatar_url, background_url FROM stores 
        WHERE store_id = ${id}`;

    if (storeQuery.rows.length === 0) {
        return null;
    } else {
        return storeQuery.rows[0];
    }
}


export async function getProductsByCategory(id: string) {
    try {

        const storeQuery = await sql<ProductDataField>`
        SELECT product_id, store_id, category_id, name, description, price, image_url FROM products
        WHERE store_id = ${id}
        ORDER BY category_id`;

        if (storeQuery.rows.length === 0) {
            return null;

        } else {

            const productsByCategory: { [key: string]: ProductDataField[] } = {};

            storeQuery.rows.forEach(product => {
                if (!productsByCategory[product.category_id]) {
                    productsByCategory[product.category_id] = [];
                }
                productsByCategory[product.category_id].push(product);
            });
            return productsByCategory;
        }
    } catch (error) {

        console.error('Error fetching products by category:', error);
        throw error;
    }
}


export async function getCart(cartData: Record<string, unknown>) {
    const list_of_product_ids = Object.keys(cartData).map(Number);

    console.log(list_of_product_ids, "  list_of_product_ids");

    if (!list_of_product_ids || list_of_product_ids.length === 0) {
        return null;
    }

    // Use a parameterized query to pass the product IDs as a list of integers
    const cartQuery = await sql<CartProductDataField>`
    SELECT p.product_id, p.store_id, p.category_id, p.name, p.description, p.price, p.image_url, s.avatar_url
    FROM products p
    JOIN stores s
    ON p.store_id = s.store_id
    WHERE p.product_id = ANY(${list_of_product_ids as any})`;

    const cartResult: Record<string, Record<string, any>> = {};

    // Iterate through the query result and construct the cart structure
    for (const product of cartQuery.rows) {
        const { store_id, product_id, name, description, price, image_url, avatar_url } = product;

        // Extract the amount from cartData using product_id
        const amount = cartData[product_id];

        // Check if store_id already exists in the hashmap
        if (!cartResult[store_id]) {
            cartResult[store_id] = {};
            cartResult[store_id]['avatar_url'] = avatar_url;
            cartResult[store_id]['products'] = {};
        }

        // Add product details to the store's dictionary, using product_id as the key
        cartResult[store_id]['products'][product_id] = {
            product_id,
            name,
            description,
            price,
            image_url,
            amount  // add the amount from cartData
        };
    }

    return cartResult;
}