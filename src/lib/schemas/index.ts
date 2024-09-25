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

export const imageUploadSchema = z
    .string()
    // Checks if the string ends with a common image file extension
    .regex(
        /\.(jpeg|jpg|png)$/,
        "Image must be a valid image format (jpeg, jpg, png)"
    );

export const nicknameSchema = z
    .string()
    .min(4, "Minimum of 4 characters for nickname")
    .max(16, "Maximum of 16 characters for nickname")
    // Allows letters, numbers, periods, underscores, and hyphens
    .regex(
        /^[a-zA-Z0-9._]+$/,
        "Nickname can only contain letters, numbers, periods, underscores, and hyphens"
    )
    .regex(
        /^(?!.*\.\.)(?!.*\.\.\.)(?!.*\.\.\.\.)(?!.*\.\.\.\.\.)(?!.*\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.)/,
        "Nickname cannot contain two or more consecutive periods"
    )
    .toLowerCase();

export const descriptionSchema = z.string().optional();

export const availabilitySchema = z.record(
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
);

export const deliveryOptionsSchema = z.array(
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
);


export const AddressDataFieldSchema = z.object({
    route: z.string().min(1, { message: "Street Address Name is required" }),
    street_number: z.string().optional(),
    subPremise: z.string().optional(),
    premise: z.string().optional(),
    country: z.string().min(1, { message: "Country is required" }),
    zipCode: z.string().min(1, { message: "Zip Code is required" }),
    city: z.string().min(1, { message: "City is required" }),
    state: z.string().optional(),
    latitude: z.number().min(-90, { message: "Latitude must be a valid number" }).max(90, { message: "Latitude must be a valid number" }),
    longitude: z.number().min(-180, { message: "Longitude must be a valid number" }).max(180, { message: "Longitude must be a valid number" }),
    deliveryNotes: z.string().optional(),
});


export const storeCreateSchema = z.object({
    nickname: nicknameSchema.nullable().optional().refine(
        (val) => val !== null && val !== undefined,
        {
            message: "Nickname is required",
        }
    ),
    locationData: AddressDataFieldSchema.nullable().optional().refine(
        (val) => val !== null && val !== undefined,
        {
            message: "Address is required",
        }
    )
});

export const storeEditSchema = z.object({
    nickname: nicknameSchema.nullable().optional().refine(
        (val) => val !== null && val !== undefined,
        {
            message: "Nickname is required",
        }
    ),
    name: z
        .string()
        .min(4, "Minimum of 4 characters for name")
        .max(16, "Maximum of 16 characters for name")
        .regex(
            /^[a-zA-Z0-9._]+$/,
            "Name can only contain letters, numbers, periods, underscores, and hyphens"
        )
        .regex(
            /^(?!.*\.\.)(?!.*\.\.\.)(?!.*\.\.\.\.)(?!.*\.\.\.\.\.)(?!.*\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.)/,
            "Name cannot contain two or more consecutive periods"
        ),
    description: descriptionSchema.nullable().optional(),
    image: imageUploadSchema.nullable().optional(),
    background: imageUploadSchema.nullable().optional()
});
