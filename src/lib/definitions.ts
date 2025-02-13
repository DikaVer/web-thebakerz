


export interface CartItem  {
    quantity: number;
    uniqueId: string;
}

export type CartData = {
    [storeId: string]: {
        storeId: string;
        nickname: string;
        image: string;
        products: CartItem[]
    };
};

export type CheckoutData = {
    deliveryMode: "PICKUP" | "DELIVERY";
    deliveryAddress: string | null;
    savedAddresses: AddressUserData | null;
    selectedTime: {
        date: `${number}/${number}/${number}`;
        time: string;
    } | null;
}


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
