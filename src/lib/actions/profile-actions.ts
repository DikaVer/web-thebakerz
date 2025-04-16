'use server';
import * as z from "zod";
import { ProfileSettingsSchema } from "@/lib/schemas";
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

    // Update the user record (name)
    if (formData.name !== user.username) {
        await updateUserProfile(formData.name, user.id);
        revalidateTag('session');
    }

    return { success: t("profileUpdated") };
};
