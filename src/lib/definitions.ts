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

export type ProductDataField = {
    id: string;
    store_id: string;
    category: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
};

export type AddressData = {
    [key: string]: AddressDataStoreField;
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

export type UsersTable = {
    id: string;
    name: string;
    email: string;
    image: string;
    role: string;
};

// export type AddressDataStorageField = {
//     shippingAddress: AddressDataStoreField | null,
//     savedAddresses: AddressData | null,
// }

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