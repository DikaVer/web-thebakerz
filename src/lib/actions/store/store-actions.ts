import * as z from "zod";

import {storeCreationSchema} from "@/lib/schemas";
import {sql} from "@vercel/postgres";

export const createStore = async (formData: z.infer<typeof storeCreationSchema>) => {
    // Validate the fields in the form using the LoginSchema
    const validateFields = storeCreationSchema.safeParse(formData);

    // If validation fails, return an error message
    if (!validateFields.success) {
        return {
            error: validateFields.error
        };
    }

    try {
        const response = await fetch(`/api/store/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                formData,
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
        return {
            error: "Something went wrong. Please try again later.",
        };
    }

};


export type StoreName = {
    storeName: string;
};

export async function fetchStoreName(
    query: string
) : Promise<StoreName> {

    try {
        const storeName = await sql<StoreName>`
      SELECT
        stores."storeName"
      FROM stores
       WHERE
        stores."storeName" = ${`${query}`}
    `;

        return storeName.rows[0];
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch users.');
    }
}