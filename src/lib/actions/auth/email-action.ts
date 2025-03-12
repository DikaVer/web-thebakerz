"use server";

import * as z from "zod";

import {ApplySchema, ContactSchema, GetStartedSchema,} from "@/lib/schemas";
import {sendContactUsForm, sendOnboardingRequest} from "@/lib/emailSendRequest";

// Function to handle authActions using form data
export const sendPaymentSupport = async ({error, description}: {error: string; description: string}) => {


    await sendContactUsForm({
        email: "Urgent Payment Support",
        subject: error + " - Urgent Payment Support",
        description: description,
    })

    return {
        success: "Email sent successfully!"
    }

};

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

    await sendContactUsForm({
        email: formData.email,
        subject: formData.subject,
        description: formData.context,
    })

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

    await sendOnboardingRequest({
        email: formData.email,
        fullName: formData.name,
        phone: formData.phone,
    });

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