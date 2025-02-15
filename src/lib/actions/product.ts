'use server';
import * as z from "zod";
import {ProductSchema} from "@/lib/schemas";
import {getCurrentSession} from "@/lib/actions/session";
import {globalPOSTRateLimit} from "@/lib/actions/requests";

// This action is similar to your sendEmail function.
export const addProduct = async (
    formData: z.infer<typeof ProductSchema>
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


    return { success: "Products updated successfully!" };
};

export async function getProductsByStoreName(storeId: string): Promise<ProductDataFull | null> {
    try {
        return {
            // 4 Bakery products
            "prod_001": {
                id: "prod_001",
                store_id: "store_001",
                category: "Bakery",
                name: "Chocolate Croissant",
                description: "A flaky croissant filled with rich chocolate.",
                price: 399,
                picture:
                    "https://storage4thebakerz.blob.core.windows.net/avatars/de6360d8-dde3-429f-a35f-6cd2d39a0d22.webp",
            },
            "prod_002": {
                id: "prod_002",
                store_id: "store_001",
                category: "Bakery",
                name: "Blueberry Muffin",
                description: "Moist muffin bursting with fresh blueberries.",
                price: 299,
                picture:
                    "https://storage4thebakerz.blob.core.windows.net/avatars/de6360d8-dde3-429f-a35f-6cd2d39a0d22.webp",
            },
            "prod_003": {
                id: "prod_003",
                store_id: "store_001",
                category: "Bakery",
                name: "Banana Bread",
                description: "Classic moist banana bread with a hint of cinnamon.",
                price: 449,
                picture:
                    "https://storage4thebakerz.blob.core.windows.net/avatars/de6360d8-dde3-429f-a35f-6cd2d39a0d22.webp",
            },
            "prod_004": {
                id: "prod_004",
                store_id: "store_001",
                category: "Bakery",
                name: "Sourdough Loaf",
                description: "Tangy, crusty sourdough bread baked fresh daily.",
                price: 599,
                picture:
                    "https://storage4thebakerz.blob.core.windows.net/avatars/de6360d8-dde3-429f-a35f-6cd2d39a0d22.webp",
            },

            // 3 Beverages products
            "prod_005": {
                id: "prod_005",
                store_id: "store_001",
                category: "Beverages",
                name: "Fresh Orange Juice",
                description: "Cold-pressed orange juice, rich in vitamin C.",
                price: 349,
                picture:
                    "https://storage4thebakerz.blob.core.windows.net/avatars/de6360d8-dde3-429f-a35f-6cd2d39a0d22.webp",
            },
            "prod_006": {
                id: "prod_006",
                store_id: "store_001",
                category: "Beverages",
                name: "Iced Coffee",
                description: "A refreshing iced coffee with a smooth flavor.",
                price: 299,
                picture:
                    "https://storage4thebakerz.blob.core.windows.net/avatars/de6360d8-dde3-429f-a35f-6cd2d39a0d22.webp",
            },
            "prod_007": {
                id: "prod_007",
                store_id: "store_001",
                category: "Beverages",
                name: "Herbal Tea",
                description: "Soothing herbal tea, perfect for a relaxing break.",
                price: 249,
                picture:
                    "https://storage4thebakerz.blob.core.windows.net/avatars/de6360d8-dde3-429f-a35f-6cd2d39a0d22.webp",
            },

            // 2 Snacks products
            "prod_008": {
                id: "prod_008",
                store_id: "store_001",
                category: "Snacks",
                name: "Mixed Nuts",
                description: "A healthy mix of almonds, cashews, and walnuts.",
                price: 499,
                picture:
                    "https://storage4thebakerz.blob.core.windows.net/avatars/de6360d8-dde3-429f-a35f-6cd2d39a0d22.webp",
            },
            "prod_009": {
                id: "prod_009",
                store_id: "store_001",
                category: "Snacks",
                name: "Granola Bar",
                description: "Crunchy granola bar with oats, honey, and dried fruits.",
                price: 199,
                picture:
                    "https://storage4thebakerz.blob.core.windows.net/avatars/de6360d8-dde3-429f-a35f-6cd2d39a0d22.webp",
            },

            // 1 Desserts product
            "prod_010": {
                id: "prod_010",
                store_id: "store_001",
                category: "Desserts",
                name: "Cheesecake",
                description: "Creamy cheesecake with a buttery graham cracker crust.",
                price: 699,
                picture:
                    "https://storage4thebakerz.blob.core.windows.net/avatars/de6360d8-dde3-429f-a35f-6cd2d39a0d22.webp",
            },
        };;
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
    description: string;
    price: number;
    picture: string;
};

export type ProductDataFull = {
    [productId: string]: ProductData;
};