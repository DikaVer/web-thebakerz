'use server';
import * as z from "zod";
import { ProfileSettingsSchema } from "@/lib/schemas";
import { updateUserProfile, updateStoreProfile } from "./profile-db";
import { getCurrentSession } from "@/lib/actions/session";
import { globalPOSTRateLimit } from "@/lib/actions/requests";
import { isStoreNicknameExist } from "@/lib/actions/user";
import {revalidateTag} from "next/cache";
import { getTranslations } from "next-intl/server";

export const updateProfile = async (
    formData: z.infer<typeof ProfileSettingsSchema>
) => {
    const t = await getTranslations("app/lib/actions/profile-actions");
    
    if (!(await globalPOSTRateLimit())) {
        return {
            error: t("tooManyRequests")
        };
    }

    // Validate the form data
    const validation = ProfileSettingsSchema.safeParse(formData);
    if (!validation.success) {
        return { error: t("invalidFields") };
    }

    const { user, store } = await getCurrentSession();
    if (!user) {
        return { error: t("userNotFound") };
    }

    // Update the user record (name and picture)
    if (formData.name !== user.username) {
        await updateUserProfile(formData.name, user.id);
        revalidateTag('session');
    }

    // If the user is a baker, update the store details (including social links)
    if (
        store &&
        formData.storeName
    ) {
        if (
            formData.storeName !== store.storeName &&
            (await isStoreNicknameExist(formData.storeName))
        ) {
            return {
                error: t("storeNameExists", { name: formData.storeName })
            };
        }

        await updateStoreProfile(
            user.id,
            formData.storeName,
            formData.description,
            formData.facebook_url,
            formData.instagram_url,
            formData.storeSlug
        );
        revalidateTag('store');
        revalidateTag('session');
    }

    return { success: t("profileUpdated") };
};
