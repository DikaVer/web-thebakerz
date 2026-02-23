'use server';
import * as z from "zod";
import {globalPOSTRateLimit} from "@/lib/utils/helper/requests";
import {OnboardSchema} from "@/lib/dashboard/schemas";
import {connectionPool} from "@/db";
import {revalidateTag} from "next/cache";
import {getCurrentSession} from "@/lib/actions/session";
import { logger } from "@/lib/logger";
import { getRequestContext } from "@/lib/request-context";

// Initialize logger for onboarding operations
const log = logger.child({ module: "onboarding" });

export const onboardBakerz = async (
    formData: z.infer<typeof OnboardSchema>,
    userId: string
) => {
    const context = await getRequestContext();
    
    log.info('onboardBakerz', 'Bakerz onboarding process started', {
        requestId: context.requestId,
        clientIP: context.clientIP,
        userId
    });
    
    if (!(await globalPOSTRateLimit())) {
        log.warn('onboardBakerz', 'Rate limit exceeded for onboarding request', {
            requestId: context.requestId,
            clientIP: context.clientIP,
            userId
        });
        return { error: "Too many requests" };
    }
    
    // Validate the form data
    const validation = OnboardSchema.safeParse(formData);
    if (!validation.success) {
        log.warn('onboardBakerz', 'Invalid form data', {
            requestId: context.requestId,
            userId,
            validationErrors: validation.error.errors
        });
        return { error: "Invalid fields!" };
    }

    const session = await getCurrentSession();
    if (!session) {
        log.warn('onboardBakerz', 'Unauthorized access - no session', {
            requestId: context.requestId,
            userId,
            clientIP: context.clientIP
        });
        return { error: "User not logged in." };
    }
    
    if (session.user?.role !== "admin") {
        log.warn('onboardBakerz', 'Permission denied - not admin', {
            requestId: context.requestId,
            userId,
            userRole: session.user?.role
        });
        return { error: "Permission Denied." };
    }
    
    const isCustomFee = formData.app_fee !==  8 || formData.delivery_fee !== 20;
    
    log.info('onboardBakerz', 'Processing onboarding request', {
        requestId: context.requestId,
        userId,
        region: formData.region,
        currency: formData.currency,
        isCustomFee,
        city: formData.city
    });

    try {
        // Start a transaction to ensure data consistency
        log.debug('onboardBakerz', 'Starting database transaction', {
            requestId: context.requestId,
            userId
        });
        
        await connectionPool.query('BEGIN');

        // 1. Insert store record
        log.debug('onboardBakerz', 'Creating store record', {
            requestId: context.requestId,
            userId,
            region: formData.region,
            currency: formData.currency
        });
        
        const result = await connectionPool.query(
            `
                INSERT INTO stores (user_id, phone, region, currency, custom_fee, custom_app_fee, custom_delivery_fee, stripe_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING id
            `,
            [userId, formData.phoneNumber, formData.region, formData.currency, isCustomFee, formData.app_fee, formData.delivery_fee, formData.stripeAccountId],
        );

        if (result.rows.length === 0) {
            log.error('onboardBakerz', 'Failed to create store record', {
                requestId: context.requestId,
                userId
            });
            throw new Error("Unexpected error with stores.");
        }

        const storeId = result.rows[0].id;
        
        log.debug('onboardBakerz', 'Store record created successfully', {
            requestId: context.requestId,
            userId,
            storeId
        });

        // 2. Insert store location
        log.debug('onboardBakerz', 'Creating store location record', {
            requestId: context.requestId,
            storeId,
            city: formData.city,
            country: formData.country
        });
        
        await connectionPool.query(
            `
              INSERT INTO store_locations (store_id, house_number, route, country, city, latitude, longitude, zip_code)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
              `,
            [storeId, formData.houseNumber, formData.route, formData.country, formData.city, formData.latitude, formData.longitude, formData.zip_code],
        );

        // 3. Insert business address
        log.debug('onboardBakerz', 'Creating business address record', {
            requestId: context.requestId,
            userId,
            businessCity: formData.businessCity,
            businessCountry: formData.businessCountry
        });
        
        const businessAddressResult = await connectionPool.query(
            `
              INSERT INTO business_address (route, city, country, zip_code)
              VALUES ($1, $2, $3, $4)
              RETURNING id
              `,
            [formData.businessRoute, formData.businessCity, formData.businessCountry, formData.businessZipCode],
        );

        if (businessAddressResult.rows.length === 0) {
            log.error('onboardBakerz', 'Failed to create business address record', {
                requestId: context.requestId,
                userId,
                storeId
            });
            throw new Error("Failed to insert business address.");
        }

        const businessAddressId = businessAddressResult.rows[0].id;
        
        log.debug('onboardBakerz', 'Business address created successfully', {
            requestId: context.requestId,
            userId,
            businessAddressId
        });

        // 4. Insert business account information
        log.debug('onboardBakerz', 'Creating business account record', {
            requestId: context.requestId,
            userId,
            businessName: formData.businessName
        });
        
        await connectionPool.query(
            `
                INSERT INTO business_acc (user_id, name, vat, kvk, bank_account, business_address_id, kor, location)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `,
            [userId, formData.businessName, formData.vat, formData.kvk, formData.bankAccount, businessAddressId, formData.kor, formData.regionBusiness],
        );

        log.debug('onboardBakerz', 'Updating user role to bakerz', {
            requestId: context.requestId,
            userId,
            name: formData.name
        });
        
        await connectionPool.query(
            `
                UPDATE users SET role = 'bakerz', name = $1 WHERE id = $2
            `,
            [formData.name, userId],
        );

        // Commit the transaction
        log.debug('onboardBakerz', 'Committing transaction', {
            requestId: context.requestId,
            userId,
            storeId
        });
        
        await connectionPool.query('COMMIT');

        revalidateTag('session', 'max')
        revalidateTag('store', 'max')
        
        log.info('onboardBakerz', 'Bakerz onboarding completed successfully', {
            requestId: context.requestId,
            userId,
            storeId,
            businessName: formData.businessName
        });
        
        return {
            success: "Successfully Onboarded Bakerz."
        }
    } catch (error: any) {
        // Rollback the transaction in case of error
        log.debug('onboardBakerz', 'Rolling back transaction due to error', {
            requestId: context.requestId,
            userId
        });
        
        await connectionPool.query('ROLLBACK');
        
        log.error('onboardBakerz', 'Failed to onboard Bakerz', {
            requestId: context.requestId,
            userId,
            error: error.message || String(error),
            stack: error.stack
        });
        
        return { error: "Failed to Onboard Bakerz." };
    }
};