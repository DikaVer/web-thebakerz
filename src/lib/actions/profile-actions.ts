'use server';
import * as z from "zod";
import { ProfileSettingsSchema } from "@/lib/utils/schemas";
import { updateUserProfile } from "./profile-db";
import { getCurrentSession } from "@/lib/actions/session";
import { globalPOSTRateLimit } from "@/lib/actions/requests";
import { revalidateTag } from "next/cache";
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

    const { user } = await getCurrentSession();
    if (!user) {
        return { error: t("userNotFound") };
    }

    // Update the user record with all profile data
    await updateUserProfile(
        formData.name,
        user.id,
        formData.birth,
        formData.sex,
        formData.push_note,
        formData.email_note,
        formData.phone_note
    );
    revalidateTag('store');
    revalidateTag('session');

    return { success: t("profileUpdated") };
};
