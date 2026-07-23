/**
 * @fileoverview Server actions for contact, support, and onboarding email forms.
 *
 * Exports actions that validate form data with Zod schemas (ContactSchema,
 * ApplySchema, GetStartedSchema) and dispatch emails through the email-send
 * request helpers: contact-us messages, urgent payment support notices, and
 * merchant onboarding applications. Also includes a phone validation action
 * used by the get-started flow. Responses are localized via next-intl.
 */
"use server";

import * as z from "zod";

import {ApplySchema, ContactSchema, GetStartedSchema,} from "@/lib/utils/schemas";
import {sendContactUsForm, sendOnboardingRequest} from "@/lib/email-send-request";
import { getTranslations } from "next-intl/server";

// Function to handle authActions using form data
export const sendPaymentSupport = async ({error, description}: {error: string; description: string}) => {
    const t = await getTranslations("app/lib/actions/auth/email-action");

    await sendContactUsForm({
        email: "Urgent Payment Support",
        subject: error + " - Urgent Payment Support",
        description: description,
    })

    return {
        success: t("emailSentSuccess")
    }
};

// Function to handle authActions using form data
export const sendEmail = async (formData: z.infer<typeof ContactSchema>) => {
    const t = await getTranslations("app/lib/actions/auth/email-action");

    // Validate the fields in the form using the LoginSchema
    const validateFields = ContactSchema.safeParse(formData);

    // If validation fails, return an error message
    if (!validateFields.success) {
        return {
            error: t("invalidFields")
        };
    }

    await sendContactUsForm({
        email: formData.email,
        subject: formData.subject,
        description: formData.context,
    })

    return {
        success: t("emailSentSuccess")
    }
};

export const sendApplication = async (formData: z.infer<typeof ApplySchema>) => {
    const t = await getTranslations("app/lib/actions/auth/email-action");

    // Validate the fields in the form using the LoginSchema
    const validateFields = ApplySchema.safeParse(formData);

    // If validation fails, return an error message
    if (!validateFields.success) {
        return {
            error: t("invalidFields")
        };
    }

    await sendOnboardingRequest({
        email: formData.email,
        fullName: formData.name,
        phone: formData.phone,
    });

    return {
        success: t("applicationSubmittedSuccess")
    }
};

export const validatePhone = async (formData: z.infer<typeof GetStartedSchema>) => {
    const t = await getTranslations("app/lib/actions/auth/email-action");

    // Validate the fields in the form using the LoginSchema
    const validateFields = GetStartedSchema.safeParse(formData);

    // If validation fails, return an error message
    if (!validateFields.success) {
        return {
            error: t("invalidFields")
        };
    }

    return {
        success: t("phoneCorrect")
    }
};