



export interface CartData {
    [storeId: string]: CartItem;
}

export interface CartItem {
    [itemId: string]: ItemCart;
}

export interface ItemCart {
    itemId: string;
    storeId: string;
    productId: string;
    note: string;
    quantity: number;
}