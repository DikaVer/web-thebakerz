'use server';
import * as z from "zod";
import {globalPOSTRateLimit} from "@/lib/actions/requests";
import {OnboardSchema} from "@/lib/dashboard/schemas";
import {connectionPool} from "@/db";
import {revalidateTag} from "next/cache";

export const onboardBakerz = async (
    formData: z.infer<typeof OnboardSchema>,
    userId: string
) => {
    if (!(await globalPOSTRateLimit())) {
        return { error: "Too many requests" };
    }
    // Validate the form data
    const validation = OnboardSchema.safeParse(formData);
    if (!validation.success) {
        return { error: "Invalid fields!" };
    }

    try {
        const result = await connectionPool.query(
            `
              INSERT INTO stores (user_id, phone)
              VALUES ($1, $2)
              RETURNING id
              `,
            [userId, formData.phoneNumber],
        );

        if (result.rows.length === 0) {
            throw new Error("Unexpected error with stores.");
        }

        await connectionPool.query(
            `
              INSERT INTO store_locations (store_id, route, country, city, latitude, longitude, zip_code)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
              `,
            [result.rows[0].id, formData.route, formData.country, formData.city, formData.latitude, formData.longitude, formData.zip_code],
        );


        await connectionPool.query(
            `
              UPDATE users
              SET role = 'bakerz'
              WHERE id = $1
              `,
            [userId],
        );

        revalidateTag('session')
        revalidateTag('store')
        return {
            success: "Successfully Onboarded Bakerz."
        }
    } catch (error: any) {
        console.error("Error Onboard Bakerz:", error);
        return { error: "Failed to Onboard Bakerz." };
    }
};