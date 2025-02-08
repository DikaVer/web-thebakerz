"use server";

import * as z from "zod";

import {ApplySchema, ContactSchema, GetStartedSchema,} from "@/lib/schemas";
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

export const sendApplication = async (formData: z.infer<typeof ApplySchema>) => {

    // Validate the fields in the form using the LoginSchema
    const validateFields = ApplySchema.safeParse(formData);

    // If validation fails, return an error message
    if (!validateFields.success) {
        return {
            error: "Invalid fields!"
        };
    }

    return {
        success: "Application was submitted successfully!"
    }

};


export const validatePhone = async (formData: z.infer<typeof GetStartedSchema>) => {

    // Validate the fields in the form using the LoginSchema
    const validateFields = GetStartedSchema.safeParse(formData);

    // If validation fails, return an error message
    if (!validateFields.success) {
        return {
            error: "Invalid fields!"
        };
    }

    return {
        success: "Phone is correct!"
    }

};