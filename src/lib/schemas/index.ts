import * as z from 'zod';
import {AddressData} from "@/lib/definitions";

export const LoginSchema = z.object({
        email: z.string()
            .trim()
            .min(1,
                {
                    message: 'Email required!'
                })
            .email({
                message: 'Invalid email!'
            }),
        redirectTo: z.string()
});

// Define the schema for AddressDataField using Zod
export const AddressDataFieldSchema = z.object({
    id: z.string().min(1, "ID is required"),
    streetAddress: z.string().min(1, "Street Address is required"),
    route: z.string().min(1, "Street Address Name is required"),
    street_number: z.string().optional(),
    subPremise: z.string().optional(),
    premise: z.string().optional(),
    country: z.string().min(1, "Country is required"),
    zipCode: z.string().min(1, "Zip Code is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    latitude: z.number().min(-90, "Latitude must be a valid number").max(90, "Latitude must be a valid number"),
    longitude: z.number().min(-180, "Longitude must be a valid number").max(180, "Longitude must be a valid number"),
    deliveryNotes: z.string().optional(),
});

// Optionally, define other related schemas if needed
export const CheckoutDataFieldSchema = z.object({
    shippingAddress: AddressDataFieldSchema.optional().nullable(),
    savedAddresses: z.record(AddressDataFieldSchema).optional().nullable(),
});
