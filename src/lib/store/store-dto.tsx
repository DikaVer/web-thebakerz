import 'server-only';
import {sql} from "@vercel/postgres";
import {ProductDataField, StoreDataField} from "@/lib/definitions";


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