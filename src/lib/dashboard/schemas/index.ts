import * as z from "zod";
import {nicknameSchema} from "@/lib/schemas";

export const UserEditSchema = z
    .object({
        role: z.string(), // e.g., "bakerz" or "user"
        name: z.string().nonempty("Name is required"),
        description: z
            .string()
            .max(2000, "Description must be at most 2000 characters")
            .optional(),
        storeName: nicknameSchema.optional(),
        storeSlug: z
            .string()
            .max(100, "Description must be at most 100 characters")
            .optional(),
        facebook_url: z
            .string()
            .optional()
            .refine((val) => {
                if (!val) return true;
                try {
                    const url = new URL(val);
                    return url.hostname.endsWith("facebook.com");
                } catch {
                    return false;
                }
            }, "Invalid Facebook URL"),
        instagram_url: z
            .string()
            .optional()
            .refine((val) => {
                if (!val) return true;
                try {
                    const url = new URL(val);
                    return url.hostname.endsWith("instagram.com");
                } catch {
                    return false;
                }
            }, "Invalid Instagram URL"),
    })
    .superRefine((data, ctx) => {
        if (data.role === "bakerz") {
            if (!data.description || data.description.trim() === "") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Description is required",
                    path: ["description"],
                });
            }
            if (!data.storeName || data.storeName.trim() === "") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Store name is required",
                    path: ["storeName"],
                });
            }
            if (!data.storeSlug || data.storeSlug.trim() === "") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Store Slug is required",
                    path: ["storeSlug"],
                });
            }
        }
    });

export const OnboardSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }).transform(val => val.trim()),
    stripeAccountId: z
        .string()
        .min(1, { message: "Stripe Account ID is required" })
        .transform(val => val.trim()),
    phoneNumber: z
        .string()
        .optional()
        .refine(
            (val) => !val || /^\+?[1-9]\d{1,14}$/.test(val),
            { message: "Invalid phone number format" }
        ),
    route: z.string().nonempty('Route is required!').transform(val => val?.trim() || ""),
    country: z.string().nonempty('Country is required!').transform(val => val?.trim() || ""),
    city: z.string().nonempty('City is required!').transform(val => val?.trim() || ""),
    latitude: z
        .number()
        .refine(val => val === undefined || (val >= -90 && val <= 90), {
            message: "Latitude must be between -90 and 90",
        }),
    longitude: z
        .number()
        .refine(val => val === undefined || (val >= -180 && val <= 180), {
            message: "Longitude must be between -180 and 180",
        }),
    zip_code: z
        .string()
        .nonempty('Zip Code is required!')
        .transform(val => val?.trim() || ""),
    // Business information fields
    businessName: z
        .string()
        .min(1, { message: "Business name is required" })
        .transform(val => val.trim()),
    vat: z
        .string()
        .min(1, { message: "VAT number is required" })
        .transform(val => val.trim()),
    kvk: z
        .string()
        .min(1, { message: "KVK number is required" })
        .transform(val => val.trim()),
    bankAccount: z
        .string()
        .min(1, { message: "Bank account is required" })
        .transform(val => val.trim()),
    businessRoute: z
        .string()
        .nonempty('Business address route is required!')
        .transform(val => val?.trim() || ""),
    businessCity: z
        .string()
        .nonempty('Business city is required!')
        .transform(val => val?.trim() || ""),
    businessZipCode: z
        .string()
        .nonempty('Business zip code is required!')
        .transform(val => val?.trim() || ""),
    businessCountry: z
        .string()
        .nonempty('Business country is required!')
        .transform(val => val?.trim() || ""),
    kor: z.boolean().default(false)
});