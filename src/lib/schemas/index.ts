import * as z from 'zod';
import {categories, cityLatLngMap, timeMap} from "@/lib/local-variables";


export const ContactSchema = z.object({
    email: z.string()
        .trim()
        .min(1,
            {
                message: 'Email required!'
            })
        .email({
            message: 'Invalid email!'
        }),
    subject: z.string().min(1, { message: "Subject is required" }).max(200, { message: "Context must be less than 200 characters" }),
    context: z.string().min(20, { message: "Context must be bigger than 50 characters" }).max(2000, { message: "Context must be less than 2000 characters" }),
});

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

export const imageUploadSchema = z.union([
    z.instanceof(File).refine(
        (file) => ["image/jpeg", "image/jpg", "image/png"].includes(file.type),
        "Image must be a valid image format (jpeg, jpg, png)"
    ).refine(
        (file) => file.size <= 100000 * 1024 * 1024,
        "File size too big (max 4.5MB)"
    ),
    z.string().url("Image must be a valid URL")
]);

export const nameSchema = z
    .string()
    .min(4, "Minimum of 4 characters for name")
    .max(120, "Maximum of 120 characters for name")
    // Allows letters, numbers, periods, underscores, hyphens, and at most 2 spaces, not starting with space
    .regex(
        /^[a-zA-Z0-9._\-&]+( [a-zA-Z0-9._\-&]*){0,2}$/,
        "Name can only contain letters, numbers, periods, underscores, hyphens, with a maximum of two spaces and cannot start with a space"
    )
    .regex(
        /^(?!.*\.\.)(?!.*\.\.\.)(?!.*\.\.\.\.)(?!.*\.\.\.\.\.)(?!.*\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.\.\.\.\.\.)(?!.*\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.)/,
        "Name cannot contain two or more consecutive periods"
    );

export const nicknameSchema = z
    .string()
    .min(4, "Minimum of 4 characters for nickname")
    .max(120, "Maximum of 120 characters for nickname")
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

export const descriptionSchema = z.string()
    .min(50, { message: "Description must be bigger than 50 characters" })
    .max(500, { message: "Description must be less than 500 characters" });

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

export const deliveryOptionsSchema = z.record(
    z.enum(Object.keys(cityLatLngMap) as [string, ...string[]], {
        errorMap: (issue, ctx) => {
            return { message: "Delivery Location must be a valid city" };
        },
    }),
    z.object({
        range: z.number()
            .min(1, { message: "Range must be a valid number greater than or equal to 1" })
            .max(10, { message: "Range must be a valid number less than or equal to 10" })
    })
);


export const AddressDataFieldSchema = z.object({
    route: z.string().min(1, { message: "Street Address Name is required" }),
    street_number: z.string().optional(),
    sub_premise: z.string().optional(),
    premise: z.string().optional(),
    country: z.string().min(1, { message: "Country is required" }),
    zip_code: z.string().min(1, { message: "Zip Code is required" }),
    city: z.string().min(1, { message: "City is required" }).optional().refine(
        (val) => val !== null && val !== undefined,
        {
            message: "City is required" ,
        }
    ),
    state: z.string().optional(),
    latitude: z.number().min(-90, { message: "Latitude must be a valid number" }).max(90, { message: "Latitude must be a valid number" }),
    longitude: z.number().min(-180, { message: "Longitude must be a valid number" }).max(180, { message: "Longitude must be a valid number" }),
    delivery_notes: z.string().max(200, {message: "Maximum 200 characters in the description note"}).optional(),
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
    name: nameSchema.nullable().optional().refine(
        (val) => val !== null && val !== undefined,
        {
            message: "Store Name is required",
        }
    ),
    description: descriptionSchema.nullable().optional(),
    image: imageUploadSchema.nullable().optional(),
    background: imageUploadSchema.nullable().optional()
});

export const productEditSchema = z.object({
    category: z.enum(Object.keys(categories) as [string, ...string[]], {
        errorMap: (issue, ctx) => {
            return { message: "Category must be from the list" };
        },
    }),
    name: nameSchema.nullable().optional().refine(
        (val) => val !== null && val !== undefined,
        {
            message: "Product Name is required",
        }
    ),
    description: descriptionSchema.nullable().optional().refine(
        (val) => val !== null && val !== undefined,
        {
            message: "Description is required",
        }
    ),
    price: z.number({
        message: "Price is required",
    }).min(0, { message: "Price must be a positive number" }).refine(
        (val) => val !== null && val !== undefined,
        {
            message: "Price is required",
        }
    ),
    image: imageUploadSchema.nullable().optional().refine(
        (val) => val !== null && val !== undefined,
        {
            message: "Product Image is required",
        }
    ),
});

export const productApiSchema = z.object({
    category: z.enum(Object.keys(categories) as [string, ...string[]], {
        errorMap: (issue, ctx) => {
            return { message: "Category must be from the list" };
        },
    }),
    name: nameSchema.nullable().optional().refine(
        (val) => val !== null && val !== undefined,
        {
            message: "Product Name is required",
        }
    ),
    description: descriptionSchema.nullable().optional().refine(
        (val) => val !== null && val !== undefined,
        {
            message: "Description is required",
        }
    ),
    price: z.number({
        message: "Price is required",
    }).min(0, { message: "Price must be a positive number" }).refine(
        (val) => val !== null && val !== undefined,
        {
            message: "Price is required",
        }
    ),
    file_url: z.string().refine(
        (val) => val !== null && val !== undefined,
        {
            message: "Product Image is required",
        }
    ),
});

export const userEditSchema = z.object({
    name: nameSchema.nullable().optional().refine(
        (val) => val !== null && val !== undefined,
        {
            message: "Name is required",
        }
    ),
    image: imageUploadSchema.nullable().optional(),
});


export const CheckoutSchema = z.object({
    deliveryMode: z.enum(['PICKUP', 'DELIVERY']),
    deliveryAddress: AddressDataFieldSchema.nullable(),
    selectedTime: z.object({
        date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Invalid date format (DD/MM/YYYY)"),
        time: z.enum(Object.keys(timeMap) as [string, ...string[]]),
    }).nullable(),
    email: z.string()
        .trim()
        .min(1, { message: 'Email is required' })
        .email({ message: 'Invalid email address' }),
    // Additional fields like cart can be validated separately or integrated here
});
