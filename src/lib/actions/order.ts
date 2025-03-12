'use server';
import * as z from "zod";
import {CustomerOrderSchema} from "@/lib/schemas";
import {globalPOSTRateLimit} from "@/lib/actions/requests";

// Order data interface
export interface OrderData {
    id: string;
    order_id: string;
    store_id: string;
    email_customer: string;
    createdAt: Date;
    amount: number;
    status: string;
    scheduled_time: {
        date: string;
        time: string;
    };
    productsData: OrderProduct;
    amount_tax: number;
}

export type OrderProduct = Array<{
    id: string;
    name: string;
    variants: string[];
    qty: number;
    price: number;
}>;

export const createOrder = async (
    formData: z.infer<typeof CustomerOrderSchema>
) => {
    if (!(await globalPOSTRateLimit())) {
        return {
            error: "Too many requests"
        };
    }

    // Validate the form data
    const validation = CustomerOrderSchema.safeParse(formData);
    if (!validation.success) {
        return { error: "Invalid fields!" };
    }

    return { success: "Profile updated successfully!" };
};