import * as z from 'zod';
import validator from "validator";
import {categories} from "@/lib/local-variables";
import { getTranslations } from "next-intl/server";


export const PhoneSchema = z.string().refine(validator.isMobilePhone, { message: "Invalid phone number" });


export const EmailSchema = z.object(
    {
        email: z.string()
            .trim()
            .min(1,
                {
                    message: 'Email required!'
                })
            .email({
                message: 'Invalid email!'
            })
            .refine(
                validator.isEmail,
                { message: "Invalid email" }
            )
    }
)


export const OTPSchema = z.object({
    otp: z.string().min(6, "OTP must be 6 digits"),
    email: z.string()
        .trim()
        .min(1,
            {
                message: 'Email required!'
            })
        .email({
            message: 'Invalid email!'
        })
        .refine(
            validator.isEmail,
            { message: "Invalid email" }
        )
});

export const GetStartedSchema = z.object({
    phone: PhoneSchema,
    terms: z.boolean().refine(val => val === true, { message: "You need to agreed with the Terms and Privacy Policy" }),
});

export const ApplySchema = z.object({
    email: z.string()
        .trim()
        .min(1,
            {
                message: 'Email required!'
            })
        .email({
            message: 'Invalid email!'
        })
        .refine(
            validator.isEmail,
            { message: "Invalid email" }
        ),
    name: z.string().min(1, { message: "Name is required" }),
    phone: PhoneSchema,
    terms: z.boolean().refine(val => val === true, { message: "You need to agreed with the Terms and Privacy Policy" }),
});



export const ContactSchema = z.object({
    email: z.string()
    .trim()
    .min(1,
        {
            message: 'Email required!'
        })
    .email({
        message: 'Invalid email!'
    })
    .refine(
        validator.isEmail,
        { message: "Invalid email" }
    ),
    subject: z.string().min(1, { message: "Subject is required" }).max(200, { message: "Context must be less than 200 characters" }),
    context: z.string().min(5, { message: "Context must be bigger than 5 characters" }).max(2000, { message: "Context must be less than 2000 characters" }),
});


// Define allowed MIME types and a maximum file size (e.g. 5 MB)
const allowedMimeTypes = [
    "image/jpeg",       // JPEG images
    "image/pjpeg",      // Progressive JPEG images
    "image/png",        // PNG images
    "image/webp",       // WebP images
    "image/svg+xml",    // SVG images
    "image/gif",        // GIF images
    "image/bmp",        // BMP images
    "image/tiff",       // TIFF images
    "image/heic",       // HEIC images (common on iOS)
    "image/heif"        // HEIF images (common on iOS)
];
// const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB - We handle large images but compress them on client

// Create a Zod schema to validate the "file" field
export const ImageSchema = z.instanceof(File)
    .refine((file) => allowedMimeTypes.includes(file.type), {
        message: "Unsupported file type. Allowed types: JPEG, PNG, WebP, GIF, SVG, BMP, TIFF, HEIC/HEIF",
    })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
        message: "File is too large. Maximum allowed size is 50MB before compression.",
    });


export const nameSchema = z
    .string()
    .min(4, "Minimum of 4 characters for name")
    .max(120, "Maximum of 120 characters for name")
    // Allows letters, numbers, periods, underscores, hyphens, brackets, and any number of spaces, and accented characters
    .regex(
        /^[a-zA-Z0-9àáâäæçèéêëìíîïòóôöùúûüÿœÀÁÂÄÆÇÈÉÊËÌÍÎÏÒÓÔÖÙÚÛÜŸŒ._\-&\[\]()'"'\s]+$/,
        "Name can only contain letters, numbers, accented characters, periods, underscores, hyphens, brackets, and spaces"
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
    .toLowerCase()
    ;

export const descriptionSchema = z.string()
    .max(1000, { message: "Description must be less than 1000 characters" });


// Schema for individual option items within a variant
export const VariantOptionSchema = z.object({
    label: z.string().min(4, { message: "Minimum 4 characters" }),
    price: z.number().min(0, { message: "Price must be a positive number" })
        .transform(val => parseFloat(val.toFixed(2)) * 100), // Convert to cents
});

// Schema for an entire variant group
export const VariantSchema = z.object({
    label: z.string().min(1, { message: "Minimum 4 characters" }),
    isSingle: z.boolean().default(true),
    required: z.boolean().default(false),
    minSelections: z.number().min(0).optional(),
    maxSelections: z.number().min(0).optional(),
    options: z.array(VariantOptionSchema).min(1, { message: "At least one option is required" }),
});


export const ProductSchema = z.object({
    category: z.enum(Object.keys(categories) as [string, ...string[]], {
        errorMap: () => ({ message: "Category must be from the list" }),
    }),
    name: nameSchema.nullable().refine(
        (val) => val !== null && val !== undefined,
        { message: "Product Name is required" }
    ),
    description: descriptionSchema.nullable().optional(),
    price: z.number({
        message: "Price is required",
    })
        .min(0, { message: "Price must be a positive number" })
        .refine((val) => val !== null && val !== undefined, {
            message: "Price is required",
        })
        .transform((val) => parseFloat(val.toFixed(2)) * 100),
    url: z
        .string()
        .url({ message: "Invalid URL" })
        .optional()
        .refine((val) => val !== null && val !== undefined, {
            message: "Image is required",
        }),
    file_picture: ImageSchema.optional(),
    ingredients: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    dietary: z.array(z.string()).optional(),
    additionalImages: z.array(z.string()).max(2).optional(),
    file_additional_pictures: z.array(ImageSchema.optional()).max(2).optional(),
    variants: z.array(VariantSchema).optional(),
    min_order: z.number().min(1, { message: "Minimum order must be at least 1" }).default(1),
    min_lead_time: z.number().min(30, { message: "Minimum lead time must be at least 30 minutes" }).default(30),
    hide_product: z.boolean().default(false),
});


export const CustomerOrderSchema = z.object({
    email: z.string()
        .trim()
        .email({
            message: 'Invalid email!'
        })
        .nonempty('Email required!')
        .refine(
            (val) => (val === undefined) || validator.isEmail,
            { message: "Invalid email" }
        ),
    name: z.string()
        .trim()
        .nonempty('Name required!')
        .min(2, { message: 'Name must be at least 2 characters' })
        .max(100, { message: 'Name must be less than 100 characters' }),
    phoneNumber: z.string()
        .refine((val) => (val === undefined) || validator.isMobilePhone , { message: "Invalid phone number" })
        .optional(),
}).refine(
    data => data.email !== undefined || data.phoneNumber !== undefined,
    {
        message: "At least one contact method (email or phone number) is required",
        path: ["email"], // this shows the error on the email field
    }
);




export const ProfileSettingsSchema = z.object({
    role: z.string().optional(),
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    birth: z.string().optional(),
    sex: z.string().optional(),
    push_note: z.boolean().optional(),
    email_note: z.boolean().optional(),
    phone_note: z.boolean().optional(),
});

    // Store settings schema with store-specific fields
export const StoreSettingsSchema = z
.object({
    role: z.string(), // e.g., "bakerz" or "user"
    description: z
        .string()
        .max(200, "Description must be at most 200 characters")
        .optional(),
    storeName: nicknameSchema,
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
        // if (!data.description || data.description.trim() === "") {
        //     ctx.addIssue({
        //         code: z.ZodIssueCode.custom,
        //         message: "Description is required",
        //         path: ["description"],
        //     });
        // }
        if (!data.storeName || data.storeName.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Store name is required",
                path: ["storeName"],
            });
        }
        // if (!data.storeSlug || data.storeSlug.trim() === "") {
        //     ctx.addIssue({
        //         code: z.ZodIssueCode.custom,
        //         message: "Store Slug is required",
        //         path: ["storeSlug"],
        //     });
        // }
    }
});

export * from './address.schema';

