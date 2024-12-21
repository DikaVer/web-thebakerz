"use server";

import * as z from "zod";

import {ContactSchema,} from "@/lib/schemas";
// Function to handle authActions using form data
export const sendEmail = async (formData: z.infer<typeof ContactSchema>) => {

    // Validate the fields in the form using the LoginSchema
    const validateFields = ContactSchema.safeParse(formData);

    // If validation fails, return an error message
    if (!validateFields.success) {
        return {
            error: "Invalid fields!"
        };
    }

    return {
        success: "Email sent successfully!"
    }

};