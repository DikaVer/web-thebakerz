"use server";

import * as z from "zod";

import { LoginSchema} from "@/lib/schemas";
import {signIn, signOut} from "@/auth";

export const login = async (formData: z.infer<typeof LoginSchema>) => {
    const validateFields = LoginSchema.safeParse(formData);


    if (!validateFields.success) {
        return {
            error: "Invalid fields!"
        };
    }

    await signIn(
        "sendgrid",
        formData)

    return {
        success: "Email sent!"
    };
};

export const loginWithProvider = async (provider: string, redirectTo: string) => {
    await signIn(
        provider,
        {
            redirectTo: redirectTo
        });
    return {
        success: "Email sent!"
    };
}

export const logout = async () => {
    await signOut();

    return {
        success: "Logged out!"
    };
}