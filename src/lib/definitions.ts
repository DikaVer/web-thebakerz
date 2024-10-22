import {AdapterUser} from "next-auth/adapters";
import {cityLatLngMap, timeMap} from "@/lib/local-variables";

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
}

export type CheckoutData = {
    deliveryMode: "PICKUP" | "DELIVERY";
    deliveryAddress: AddressDataUserField | null;
    savedAddresses: AddressUserData | null;
    date: `${number}/${number}/${number}` | null;
    time: keyof typeof timeMap | null;
}

export type ProductData = Array<ProductDataField>;

export type ProductDataField = {
    id: string;
    store_id: string;
    category: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    rating?: string;
};

export type AddressUserData = {
    [key: string]: AddressDataUserField;
}

export type AddressDataStoreField = {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    premise?: string;
    route: string;
    state: string;
    street_number: string;
    sub_premise?: string;
    zip_code: string;
};

export type AddressDataUserField = {
    id: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    premise?: string;
    route: string;
    state: string;
    street_number: string;
    sub_premise?: string;
    zip_code: string;
    delivery_notes?: string;
};

export type UsersData = {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
    date: string;
};

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

export interface StoreData {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    location: AddressDataStoreField;
    image: string | null;
    background_url: string | null;
    nickname: string;
    products: Array<ProductDataField>;
    deliveryOptions: Record<
        keyof typeof cityLatLngMap,
        {
            range: number;
        }
    > | null;
    availability: Record<
        string,
        {
            from: keyof typeof timeMap;
            to: keyof typeof timeMap;
            availability: "Free" | "Busy";
        }
    > | null;
}

// Define a custom User type
export interface CustomAdapterUser extends AdapterUser {
    role: string;
}

export interface ProductByCategory {
    [key: string]: ProductDataField[];
}