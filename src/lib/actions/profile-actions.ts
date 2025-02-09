'use server';
import * as z from "zod";
import { ProfileSchema } from "@/lib/schemas";
import { updateUserProfile, updateStoreProfile } from "./profile-db";
import {getCurrentSession} from "@/lib/actions/session";
import {globalPOSTRateLimit} from "@/lib/actions/requests";
import {isStoreNicknameExist} from "@/lib/actions/user"; // see next section

// This action is similar to your sendEmail function.
export const updateProfile = async (
    formData: z.infer<typeof ProfileSchema>,
    role: string
) => {

    if (!await globalPOSTRateLimit()){
        return {
            error: "Too many requests"
        }
    }
    // Validate the form data
    const validation = ProfileSchema.safeParse(formData);
    if (!validation.success) {
        return { error: "Invalid fields!" };
    }

    const {session, user, store} = await getCurrentSession();

    if (!user) {
        return { error: "User not found!" };
    }

    // Update the user record (name and picture)
    await updateUserProfile(formData.name, user.id);

    // If the user is a baker, update the store details as well
    if (role === "bakerz" && formData.storeName && formData.description) {
        if(await isStoreNicknameExist(formData.storeName)){
            return {
                error: `Store name "${formData.storeName}" already exists`
            }
        }

        await updateStoreProfile(
            formData.storeName,
            formData.description,
            user.id
        );
    }

    return { success: "Profile updated successfully!" };
};
