export type ProductDataField = {
    product_id: string;
    store_id: string;
    category_id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
};

export type StoreDataField = {
    store_id: string;
    description: string;
    location: string;
    avatar_url: string;
    background_url: string;
};

export interface ProductByCategory {
    [key: string]: ProductDataField[];
}