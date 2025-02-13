
export async function getProductsByStoreName(storeId: string): Promise<ProductData[] | null> {
    try {
        return fakeProducts;
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

export const fakeProducts: ProductData[] = [
    // 4 Bakery products
    {
        id: "prod_001",
        store_id: "store_001",
        category: "Bakery",
        name: "Chocolate Croissant",
        description: "A flaky croissant filled with rich chocolate.",
        price: 3.99,
        picture:
            "https://storage4thebakerz.blob.core.windows.net/avatars/de6360d8-dde3-429f-a35f-6cd2d39a0d22.webp",
    },
    {
        id: "prod_002",
        store_id: "store_001",
        category: "Bakery",
        name: "Blueberry Muffin",
        description: "Moist muffin bursting with fresh blueberries.",
        price: 2.99,
        picture:
            "https://storage4thebakerz.blob.core.windows.net/avatars/de6360d8-dde3-429f-a35f-6cd2d39a0d22.webp",
    },
    {
        id: "prod_003",
        store_id: "store_001",
        category: "Bakery",
        name: "Banana Bread",
        description: "Classic moist banana bread with a hint of cinnamon.",
        price: 4.49,
        picture:
            "https://storage4thebakerz.blob.core.windows.net/avatars/de6360d8-dde3-429f-a35f-6cd2d39a0d22.webp",
    },
    {
        id: "prod_004",
        store_id: "store_001",
        category: "Bakery",
        name: "Sourdough Loaf",
        description: "Tangy, crusty sourdough bread baked fresh daily.",
        price: 5.99,
        picture:
            "https://storage4thebakerz.blob.core.windows.net/avatars/de6360d8-dde3-429f-a35f-6cd2d39a0d22.webp",
    },

    // 3 Beverages products
    {
        id: "prod_005",
        store_id: "store_001",
        category: "Beverages",
        name: "Fresh Orange Juice",
        description: "Cold-pressed orange juice, rich in vitamin C.",
        price: 3.49,
        picture:
            "https://storage4thebakerz.blob.core.windows.net/avatars/de6360d8-dde3-429f-a35f-6cd2d39a0d22.webp",
    },
    {
        id: "prod_006",
        store_id: "store_001",
        category: "Beverages",
        name: "Iced Coffee",
        description: "A refreshing iced coffee with a smooth flavor.",
        price: 2.99,
        picture:
            "https://storage4thebakerz.blob.core.windows.net/avatars/de6360d8-dde3-429f-a35f-6cd2d39a0d22.webp",
    },
    {
        id: "prod_007",
        store_id: "store_001",
        category: "Beverages",
        name: "Herbal Tea",
        description: "Soothing herbal tea, perfect for a relaxing break.",
        price: 2.49,
        picture:
            "https://storage4thebakerz.blob.core.windows.net/avatars/de6360d8-dde3-429f-a35f-6cd2d39a0d22.webp",
    },

    // 2 Snacks products
    {
        id: "prod_008",
        store_id: "store_001",
        category: "Snacks",
        name: "Mixed Nuts",
        description: "A healthy mix of almonds, cashews, and walnuts.",
        price: 4.99,
        picture:
            "https://storage4thebakerz.blob.core.windows.net/avatars/de6360d8-dde3-429f-a35f-6cd2d39a0d22.webp",
    },
    {
        id: "prod_009",
        store_id: "store_001",
        category: "Snacks",
        name: "Granola Bar",
        description: "Crunchy granola bar with oats, honey, and dried fruits.",
        price: 1.99,
        picture:
            "https://storage4thebakerz.blob.core.windows.net/avatars/de6360d8-dde3-429f-a35f-6cd2d39a0d22.webp",
    },

    // 1 Desserts product
    {
        id: "prod_010",
        store_id: "store_001",
        category: "Desserts",
        name: "Cheesecake",
        description: "Creamy cheesecake with a buttery graham cracker crust.",
        price: 6.99,
        picture:
            "https://storage4thebakerz.blob.core.windows.net/avatars/de6360d8-dde3-429f-a35f-6cd2d39a0d22.webp",
    },
];