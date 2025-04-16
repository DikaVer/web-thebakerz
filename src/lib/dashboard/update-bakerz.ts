'use server';
import * as z from "zod";
import {globalPOSTRateLimit} from "@/lib/actions/requests";
import {OnboardSchema} from "@/lib/dashboard/schemas";
import {connectionPool} from "@/db";
import {revalidateTag} from "next/cache";
import {getCurrentSession} from "@/lib/actions/session";

export const updateBakerz = async (
    formData: z.infer<typeof OnboardSchema>,
    userId: string,
    storeId: string
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
    
    const isCustomFee = formData.app_fee !== 8 || formData.delivery_fee !== 20;

    try {
        // Start a transaction to ensure data consistency
        await connectionPool.query('BEGIN');

        // 1. Update store record
        await connectionPool.query(
            `
                UPDATE stores 
                SET phone = $1, 
                    region = $2, 
                    currency = $3, 
                    custom_fee = $4, 
                    custom_app_fee = $5, 
                    custom_delivery_fee = $6, 
                    stripe_id = $7
                WHERE id = $9 AND user_id = $10
            `,
            [
                formData.phoneNumber, 
                formData.region, 
                formData.currency, 
                isCustomFee, 
                formData.app_fee, 
                formData.delivery_fee, 
                formData.stripeAccountId,
                storeId,
                userId
            ],
        );

        // 2. Update store location
        await connectionPool.query(
            `
                UPDATE store_locations 
                SET route = $1, 
                    country = $2, 
                    city = $3, 
                    latitude = $4, 
                    longitude = $5, 
                    zip_code = $6
                WHERE store_id = $7
            `,
            [
                formData.route, 
                formData.country, 
                formData.city, 
                formData.latitude, 
                formData.longitude, 
                formData.zip_code,
                storeId
            ],
        );


        const businessResult = await connectionPool.query(
            `
                UPDATE business_acc 
                SET name = $1, 
                    vat = $2, 
                    kvk = $3, 
                    bank_account = $4, 
                    kor = $5, 
                    location = $6
                WHERE user_id = $7
                RETURNING business_address_id
            `,
            [formData.businessName, formData.vat, formData.kvk, formData.bankAccount, formData.kor, formData.regionBusiness, userId]
        );

       
        const businessAddressId = businessResult.rows[0].business_address_id;

        // 3a. Update business address
        await connectionPool.query(
            `
                UPDATE business_address 
                SET route = $1, 
                    city = $2, 
                    country = $3, 
                    zip_code = $4
                WHERE id = $5
            `,
            [formData.businessRoute, formData.businessCity, formData.businessCountry, formData.businessZipCode, businessAddressId]
        );

        

        // 4. Update user email if provided
        if (formData.email) {
            await connectionPool.query(
                `
                    UPDATE users 
                    SET email = $1,
                        name = $2
                    WHERE id = $3
                `,
                [formData.email, formData.name, userId]
            );
        }

        // Commit the transaction
        await connectionPool.query('COMMIT');

        revalidateTag('session');
        revalidateTag('store');
        return {
            success: "Successfully Updated Bakerz."
        };
    } catch (error: any) {
        // Rollback the transaction in case of error
        await connectionPool.query('ROLLBACK');
        console.error("Error Updating Bakerz:", error);
        return { error: "Failed to Update Bakerz." };
    }
};
