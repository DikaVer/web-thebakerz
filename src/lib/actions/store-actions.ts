'use server';
import * as z from "zod";
import { StoreSettingsSchema } from "@/lib/utils/schemas";
import { getCurrentSession } from "@/lib/actions/session";
import { globalPOSTRateLimit } from "@/lib/utils/helper/requests";
import { isStoreNicknameExist } from "@/lib/actions/user";
import { revalidateTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { connectionPool } from "@/db";
import { logger } from "../logger";
import { uploadImage } from "./image";

export const updateStore = async (
    formData: z.infer<typeof StoreSettingsSchema>,
    storeId: string
) => {
    const t = await getTranslations("app/lib/actions/store-actions");
    
    if (!(await globalPOSTRateLimit())) {
        return {
            error: t("tooManyRequests")
        };
    }

    // Validate the form data
    const validation = StoreSettingsSchema.safeParse(formData);
    if (!validation.success) {
        return { error: t("invalidFields") };
    }

    const { user } = await getCurrentSession();
    if (!user) {
        return { error: t("userNotFound") };
    }

    // Check if the store name is already taken (by someone else)
    if (await isStoreNicknameExist(formData.storeName, user.id)) {
        return {
            error: t("storeNameExists", { name: formData.storeName })
        };
    }

    // Update store details
    await updateStoreProfile(
        user.id,
        storeId,
        formData.storeName,
        formData.description,
        formData.facebook_url,
        formData.instagram_url,
        formData.storeSlug
    );
    
    revalidateTag('store');
    revalidateTag('session');

    return { success: t("storeUpdated") };
}; 

export async function updateMinOrderTime(storeId: string, minutes: number): Promise<boolean> {
    try {

        const {user, stores} = await getCurrentSession();
        const store = stores?.find((store) => store.id === storeId);

        if (!user || !store) {
            throw new Error("Unauthorized");
        }

        await connectionPool.query(
            `UPDATE stores SET min_time_order = $1 WHERE id = $2 AND user_id = $3`,
            [minutes, store.id, user.id]
        );

        revalidateTag('store');
        return true;
    } catch (error) {
        console.error("Error updating minimum order time:", error);
        throw new Error("Failed to update minimum order time");
    }
}

export async function updateStoreDeliveryOptions(storeId: string, deliveryOption: 'pickup' | 'delivery' | 'multi'): Promise<boolean> {
    try {

        const {user, stores} = await getCurrentSession();
        const store = stores?.find((store) => store.id === storeId);

        if (!user || !store) {
            throw new Error("Unauthorized");
        }


        // Update the store's delivery option in the database
        await connectionPool.query(
            `UPDATE stores SET delivery_option = $1 WHERE id = $2 AND user_id = $3`,
            [deliveryOption, store.id, user.id]
        );

        revalidateTag('store');
        return true;
    } catch (error) {
        console.error("Error updating store delivery options:", error);
        throw new Error("Failed to update store delivery options");
    }
}

export async function updatePickupWindow(storeId: string, minutes: number): Promise<boolean> {
    try {
        const {user, stores} = await getCurrentSession();
        const store = stores?.find((store) => store.id === storeId);

        if (!user || !store) {
            throw new Error("Unauthorized");
        }

        await connectionPool.query(
            `UPDATE stores SET pickup_window = $1 WHERE id = $2 AND user_id = $3`,
            [minutes, store.id, user.id]
        );

        revalidateTag('store');
        return true;
    } catch (error) {
        logger.error("Error updating pickup window:", error instanceof Error ? error.message : String(error));
        throw new Error("Failed to update pickup window");
    }
}

export async function updateStoreBackground(storeId: string, file: File): Promise<boolean> {
    try {
        const {user, stores} = await getCurrentSession();
        const store = stores?.find((store) => store.id === storeId);

        if (!user || !store) {
            throw new Error("Unauthorized");
        }

        const {url, error} = await uploadImage(file, "background");
        if (error) {
            throw new Error(error);
        }

        logger.debug("store", store.id);
        logger.debug("user", user.id);

        // Update the store's background image in the database
        await connectionPool.query(
            `UPDATE stores SET background = $1 WHERE id = $2 AND user_id = $3`,
            [url, store.id, user.id]
        );

        revalidateTag('store');
        return true;
    } catch (error) {
        console.error("Error updating store background image:", error);
        throw new Error("Failed to update store background image");
    }
}

// Update the store record (only for bakerz) with storeName, description, and phone
export async function updateStoreProfile(
    id: string,
    storeId: string,
    storeName: string,
    description?: string,
    facebook_url?: string,
    instagram_url?: string,
    storeSlug?: string
): Promise<any> {
    try {
        const result = await connectionPool.query(
            `UPDATE stores
             SET nickname = $1,
                 description = $2,
                 facebook_url = $3,
                 instagram_url = $4,
                 slug = $5
             WHERE user_id = $6 AND id = $7
             RETURNING id
             `,
            [storeName, description, facebook_url, instagram_url, storeSlug, id, storeId]
        );
        if (result.rows.length === 0) {
            throw new Error("Store not found");
        }
        return result.rows[0];
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to update store.");
    }
}