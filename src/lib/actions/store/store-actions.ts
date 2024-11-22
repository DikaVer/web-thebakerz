"use server";
import * as z from "zod";

import {storeCreateSchema, storeEditSchema} from "@/lib/schemas";
import {auth} from "@/auth";

export const createStore = async (formData: z.infer<typeof storeCreateSchema>) => {
    // Validate the fields in the form using the LoginSchema
    const validateFields = storeCreateSchema.safeParse(formData);

    // If validation fails, return an error message
    if (!validateFields.success) {
        return {
            error: validateFields.error
        };
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NEXT_PRIVATE_API_SECRET_KEY}`
            },
            body: JSON.stringify({
                storeData: formData
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                error: result.message,
            }
        }

        return {
            success: "Store created successfully",
        }

    } catch (error) {
        console.error("Error creating store", error);
        return {
            error: "Something went wrong. Please try again later.",
        };
    }

};

