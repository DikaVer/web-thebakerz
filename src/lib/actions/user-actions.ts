'use server';
import * as z from "zod";
import { ProfileSettingsSchema } from "@/lib/utils/schemas";
import { getCurrentSession } from "@/lib/actions/session";
import { globalPOSTRateLimit } from "@/lib/utils/helper/requests";
import { revalidateTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { connectionPool } from "@/db";

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


// Update the user record with the new name and picture
export async function updateUserProfile(
    name: string,
    id: string,
    birth?: string,
    sex?: string,
    push_note?: boolean,
    email_note?: boolean,
    phone_note?: boolean
): Promise<any> {
    try {
        const result = await connectionPool.query(
            `UPDATE users 
             SET name = $1, 
                 birth = $2,
                 sex = $3,
                 push_note = $4,
                 email_note = $5,
                 phone_note = $6
             WHERE id = $7 
             RETURNING id`,
            [name, birth, sex, push_note, email_note, phone_note, id]
        );
        if (result.rows.length === 0) {
            throw new Error("User not found");
        }
        return result.rows[0];
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to update user.");
    }
}
