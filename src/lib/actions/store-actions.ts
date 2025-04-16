'use server';
import * as z from "zod";
import { StoreSettingsSchema } from "@/lib/schemas/index";
import { updateStoreProfile } from "./profile-db";
import { getCurrentSession } from "@/lib/actions/session";
import { globalPOSTRateLimit } from "@/lib/actions/requests";
import { isStoreNicknameExist } from "@/lib/actions/user";
import { revalidateTag } from "next/cache";
import { getTranslations } from "next-intl/server";

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