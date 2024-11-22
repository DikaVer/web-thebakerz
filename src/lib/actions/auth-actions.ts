"use server";

import * as z from "zod";

import { LoginSchema } from "@/lib/schemas";
import { signIn, signOut } from "@/auth";

// Function to handle authActions using form data
export const login = async (formData: z.infer<typeof LoginSchema>) => {
    // Validate the fields in the form using the LoginSchema
    const validateFields = LoginSchema.safeParse(formData);

    // If validation fails, return an error message
    if (!validateFields.success) {
        return {
            error: "Invalid fields!"
        };
    }

    // If validation succeeds, attempt to sign in using the "sendgrid" provider
    await signIn("sendgrid", formData);
};

export const loginWithProvider = async (provider: string, redirectTo: string) => {
    // Attempt to sign in using the provided provider and redirect URL
    await signIn(provider, { redirectTo });
};

// Function to handle logout
export const logout = async () => {

    // Attempt to sign out the user
    await signOut();

    // Return success message when the user is logged out
    return {
        success: "Logged out!"
    };
};
