import * as z from 'zod';
import {cityLatLngMap, timeMap} from "@/lib/local-variables";

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


export const imageUploadSchema = z
    .string()
    // Checks if the string ends with a common image file extension
    .regex(
        /\.(jpeg|jpg|png)$/,
        "Background image must be a valid image format (jpeg, jpg, png)"
    );


export const storeCreationSchema = z.object({
    storeName: z
        .string()
        .min(4, "Minimum of 4 characters for store name")
        .max(16, "Maximum of 16 characters for store name")
        // Allows letters, numbers, periods, underscores, and hyphens
        .regex(
            /^[a-zA-Z0-9._]+$/,
            "Store name can only contain letters, numbers, periods, underscores, and hyphens"
        )
        .regex(
            /^(?!.*\.\.)(?!.*\.\.\.)(?!.*\.\.\.\.)(?!.*\.\.\.\.\.)(?!.*\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.)/,
            "Store name cannot contain two or more consecutive periods"
        )
        .toLowerCase(),

    description: z.string().optional(),
    backgroundImage: imageUploadSchema.nullable(),
    delivery: z.boolean().default(false),
    address: AddressDataFieldSchema.optional().nullable().refine(
        (val) => val !== null && val !== undefined,
        {
            message: "Address is required",
        }
    ),

    availabilityCalendar: z.record(
        z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Invalid date format, expected DD/MM/YYYY"),
        z.object({
            from: z.enum(Object.keys(timeMap) as [string, ...string[]], {
                errorMap: (issue, ctx) => {
                    return { message: "Incorrect time in availability" };
                },
            }),
            to: z.enum(Object.keys(timeMap) as [string, ...string[]], {
                errorMap: (issue, ctx) => {
                    return { message: "Incorrect time in availability" };
                },
            }),
            availability: z.enum(["Free", "Busy"], {
                errorMap: (issue, ctx) => {
                    return { message: "Availability must be Free or Busy" };
                },
            }),
        })
    ),

    deliveryLocations: z.array(
        z.object({
            location: z.enum(Object.keys(cityLatLngMap) as [string, ...string[]], {
                errorMap: (issue, ctx) => {
                    return { message: "Delivery Location must be a valid city" };
                },
            }), // location key
            range: z.number()
                .min(1, { message: "Range must be a valid number greater than or equal to 1" })
                .max(10, { message: "Range must be a valid number less than or equal to 10" })
        })
    ),
});
