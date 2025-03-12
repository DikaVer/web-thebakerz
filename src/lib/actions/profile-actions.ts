'use server';
import * as z from "zod";
import { ProfileSettingsSchema } from "@/lib/schemas";
import { updateUserProfile, updateStoreProfile } from "./profile-db";
import { getCurrentSession } from "@/lib/actions/session";
import { globalPOSTRateLimit } from "@/lib/actions/requests";
import { isStoreNicknameExist } from "@/lib/actions/user";
import {revalidateTag} from "next/cache";

export const updateProfile = async (
    formData: z.infer<typeof ProfileSettingsSchema>
) => {
    if (!(await globalPOSTRateLimit())) {
        return {
            error: "Too many requests"
        };
    }

    // Validate the form data
    const validation = ProfileSettingsSchema.safeParse(formData);
    if (!validation.success) {
        return { error: "Invalid fields!" };
    }

    const { user, store } = await getCurrentSession();
    if (!user) {
        return { error: "User not found!" };
    }

    // Update the user record (name and picture)
    if (formData.name !== user.username) {
        await updateUserProfile(formData.name, user.id);
        revalidateTag('session');
    }

    // If the user is a baker, update the store details (including social links)
    if (
        store &&
        formData.storeName &&
        formData.description
    ) {
        if (
            formData.storeName !== store.storeName &&
            (await isStoreNicknameExist(formData.storeName))
        ) {
            return {
                error: `Store name "${formData.storeName}" already exists`
            };
        }

        await updateStoreProfile(
            formData.storeName,
            formData.description,
            user.id,
            formData.facebook_url,
            formData.instagram_url,
            formData.storeSlug
        );
        revalidateTag('store');
    }

    return { success: "Profile updated successfully!" };
};
