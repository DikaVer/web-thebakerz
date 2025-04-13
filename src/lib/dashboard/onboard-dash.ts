'use server';
import * as z from "zod";
import {globalPOSTRateLimit} from "@/lib/actions/requests";
import {OnboardSchema} from "@/lib/dashboard/schemas";
import {connectionPool} from "@/db";
import {revalidateTag} from "next/cache";
import {getCurrentSession} from "@/lib/actions/session";

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

    const session = await getCurrentSession();
    if (!session) {
        return { error: "User not logged in." };
    }
    if (session.user?.role !== "admin") {
        return { error: "Permission Denied." };
    }
    const isCustomFee = formData.app_fee !==  8 || formData.delivery_fee !== 20;

    try {
        // Start a transaction to ensure data consistency
        await connectionPool.query('BEGIN');

        // 1. Insert store record
        const result = await connectionPool.query(
            `
                INSERT INTO stores (user_id, phone, region, currency, custom_fee, custom_app_fee, custom_delivery_fee, stripe_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING id
            `,
            [userId, formData.phoneNumber, formData.region, formData.currency, isCustomFee, formData.app_fee, formData.delivery_fee, formData.stripeAccountId],
        );

        if (result.rows.length === 0) {
            throw new Error("Unexpected error with stores.");
        }

        const storeId = result.rows[0].id;

        // 2. Insert store location
        await connectionPool.query(
            `
              INSERT INTO store_locations (store_id, route, country, city, latitude, longitude, zip_code)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
              `,
            [storeId, formData.route, formData.country, formData.city, formData.latitude, formData.longitude, formData.zip_code],
        );

        // 3. Insert business address
        const businessAddressResult = await connectionPool.query(
            `
              INSERT INTO business_address (route, city, country, zip_code)
              VALUES ($1, $2, $3, $4)
              RETURNING id
              `,
            [formData.businessRoute, formData.businessCity, formData.businessCountry, formData.businessZipCode],
        );

        if (businessAddressResult.rows.length === 0) {
            throw new Error("Failed to insert business address.");
        }

        const businessAddressId = businessAddressResult.rows[0].id;

        // 4. Insert business account information
        await connectionPool.query(
            `
                INSERT INTO business_acc (user_id, name, vat, kvk, bank_account, business_address_id, kor, location)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `,
            [userId, formData.businessName, formData.vat, formData.kvk, formData.bankAccount, businessAddressId, formData.kor, formData.regionBusiness],
        );

        await connectionPool.query(
            `
                UPDATE users SET role = 'bakerz', name = $1 WHERE id = $2
            `,
            [formData.name, userId],
        );

        // Commit the transaction
        await connectionPool.query('COMMIT');

        revalidateTag('session')
        revalidateTag('store')
        return {
            success: "Successfully Onboarded Bakerz."
        }
    } catch (error: any) {
        // Rollback the transaction in case of error
        await connectionPool.query('ROLLBACK');
        console.error("Error Onboard Bakerz:", error);
        return { error: "Failed to Onboard Bakerz." };
    }
};