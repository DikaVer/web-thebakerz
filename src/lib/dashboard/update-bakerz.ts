'use server';
import * as z from "zod";
import {globalPOSTRateLimit} from "@/lib/utils/helper/requests";
import {OnboardSchema} from "@/lib/dashboard/schemas";
import {connectionPool} from "@/db";
import {revalidateTag} from "next/cache";
import {getCurrentSession} from "@/lib/actions/session";
import { logger } from "@/lib/logger";
import { getRequestContext } from "@/lib/request-context";

// Initialize logger for bakerz update operations
const log = logger.child({ module: "bakerz-update" });

export const updateBakerz = async (
    formData: z.infer<typeof OnboardSchema>,
    userId: string,
    storeId: string
) => {
    const context = await getRequestContext();
    
    log.info('updateBakerz', 'Bakerz update process started', {
        requestId: context.requestId,
        clientIP: context.clientIP,
        userId,
        storeId
    });
    
    if (!(await globalPOSTRateLimit())) {
        log.warn('updateBakerz', 'Rate limit exceeded for update request', {
            requestId: context.requestId,
            clientIP: context.clientIP,
            userId,
            storeId
        });
        return { error: "Too many requests" };
    }
    
    // Validate the form data
    const validation = OnboardSchema.safeParse(formData);
    if (!validation.success) {
        log.warn('updateBakerz', 'Invalid form data', {
            requestId: context.requestId,
            userId,
            storeId,
            validationErrors: validation.error.errors
        });
        return { error: "Invalid fields!" };
    }

    const session = await getCurrentSession();
    if (!session) {
        log.warn('updateBakerz', 'Unauthorized access - no session', {
            requestId: context.requestId,
            userId,
            storeId,
            clientIP: context.clientIP
        });
        return { error: "User not logged in." };
    }
    
    if (session.user?.role !== "admin") {
        log.warn('updateBakerz', 'Permission denied - not admin', {
            requestId: context.requestId,
            userId,
            storeId,
            userRole: session.user?.role
        });
        return { error: "Permission Denied." };
    }
    
    const isCustomFee = formData.app_fee !== 8 || formData.delivery_fee !== 20;
    
    log.info('updateBakerz', 'Processing update request', {
        requestId: context.requestId,
        userId,
        storeId,
        region: formData.region,
        currency: formData.currency,
        isCustomFee,
        isBanned: formData.banned,
        isHidden: formData.hidden
    });

    try {
        // Start a transaction to ensure data consistency
        log.debug('updateBakerz', 'Starting database transaction', {
            requestId: context.requestId,
            userId,
            storeId
        });
        
        await connectionPool.query('BEGIN');

        // 1. Update store record
        log.debug('updateBakerz', 'Updating store record', {
            requestId: context.requestId,
            userId,
            storeId,
            region: formData.region,
            currency: formData.currency
        });
        
        await connectionPool.query(
            `
                UPDATE stores 
                SET phone = $1, 
                    region = $2, 
                    currency = $3, 
                    custom_fee = $4, 
                    custom_app_fee = $5, 
                    custom_delivery_fee = $6, 
                    stripe_id = $7, 
                    deleted = $8,
                    hidden = $9,
                    hide_phone = $10,
                    hide_street = $11
                WHERE id = $12 AND user_id = $13
            `,
            [
                formData.phoneNumber, 
                formData.region, 
                formData.currency, 
                isCustomFee, 
                formData.app_fee, 
                formData.delivery_fee, 
                formData.stripeAccountId,
                formData.banned,
                formData.hidden,
                formData.hide_phone,
                formData.hide_street,
                storeId,
                userId
            ],
        );

        // 2. Update store location
        log.debug('updateBakerz', 'Updating store location', {
            requestId: context.requestId,
            storeId,
            city: formData.city,
            country: formData.country
        });
        
        await connectionPool.query(
            `
                UPDATE store_locations 
                SET route = $1, 
                    house_number = $2,
                    country = $3, 
                    city = $4, 
                    latitude = $5, 
                    longitude = $6, 
                    zip_code = $7
                WHERE store_id = $8
            `,
            [
                formData.route,
                formData.houseNumber,
                formData.country, 
                formData.city, 
                formData.latitude, 
                formData.longitude, 
                formData.zip_code,
                storeId
            ],
        );

        log.debug('updateBakerz', 'Updating business account', {
            requestId: context.requestId,
            userId,
            businessName: formData.businessName
        });
        
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
        log.debug('updateBakerz', 'Updating business address', {
            requestId: context.requestId,
            userId,
            businessAddressId,
            businessCity: formData.businessCity,
            businessCountry: formData.businessCountry
        });
        
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

        const normalizedEmail = formData?.email?.toLowerCase();

        // 4. Update user email if provided
        if (normalizedEmail) {
            log.debug('updateBakerz', 'Updating user email and name', {
                requestId: context.requestId,
                userId,
                name: formData.name
            });
            
            await connectionPool.query(
                `
                    UPDATE users 
                    SET email = $1,
                        name = $2
                    WHERE id = $3
                `,
                [normalizedEmail, formData.name, userId]
            );
        }

        // Commit the transaction
        log.debug('updateBakerz', 'Committing transaction', {
            requestId: context.requestId,
            userId,
            storeId
        });
        
        await connectionPool.query('COMMIT');

        revalidateTag('session', 'max');
        revalidateTag('store', 'max');
        
        log.info('updateBakerz', 'Bakerz update completed successfully', {
            requestId: context.requestId,
            userId,
            storeId,
            businessName: formData.businessName
        });
        
        return {
            success: "Successfully Updated Bakerz."
        };
    } catch (error: any) {
        // Rollback the transaction in case of error
        log.debug('updateBakerz', 'Rolling back transaction due to error', {
            requestId: context.requestId,
            userId,
            storeId
        });
        
        await connectionPool.query('ROLLBACK');
        
        log.error('updateBakerz', 'Failed to update Bakerz', {
            requestId: context.requestId,
            userId,
            storeId,
            error: error.message || String(error),
            stack: error.stack
        });
        
        return { error: "Failed to Update Bakerz." };
    }
};
