import {AdapterUser} from "next-auth/adapters";

export interface Session {
    user: {
        id: string;
        name: string;
        email: string;
        emailVerified: string;
        image: string;
        role: string;
        userToken: string;
    };
    id: string;
    userId: string;
    expires: string;
    sessionToken: string;
};

export type ProductDataField = {
    product_id: string;
    store_id: string;
    category_id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
};

export type AddressData = {
    [key: string]: AddressDataField;
}

export type AddressDataField = {
    id: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    premise: string;
    route: string;
    state: string;
    streetAddress: string;
    street_number: string;
    subPremise: string;
    zipCode: string;
    [key: string]: any;
};

export type CheckoutLocalDataField = {
    deliveryMode: string,
    shippingAddress: AddressDataField | null,
    savedAddresses: AddressData | null,
    date: string | null,
    time: string | null,
}

export type AddressDataStorageField = {
    shippingAddress: AddressDataField | null,
    savedAddresses: AddressData | null,
}

export type CartProductDataField = {
    product_id: string;
    store_id: string;
    category_id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    avatar_url: string;
}

export type StoreDataField = {
    store_id: string;
    description: string;
    location: string;
    avatar_url: string;
    background_url: string;
};

export interface ShopItemField {
    product_id: number;
    name: string;
    description: string;
    price: number;
    image_url: string;
    amount: number;
}

// Define a custom User type
export interface CustomAdapterUser extends AdapterUser {
    role: string;
}

export interface ProductByCategory {
    [key: string]: ProductDataField[];
}