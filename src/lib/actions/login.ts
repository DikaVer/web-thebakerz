"use server";

import * as z from "zod";

import { LoginSchema} from "@/lib/schemas";

export const login = async (formData: z.infer<typeof LoginSchema>) => {
    const validateFields = LoginSchema.safeParse(formData);
    console.log(formData);
    if (!validateFields.success) {
        return {
            error: "Invalid fields!"
        };
    }

    return {
        success: "Email sent!"
    };
};