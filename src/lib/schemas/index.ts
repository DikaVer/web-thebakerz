import * as z from 'zod';
import validator from "validator";
import {categories} from "@/lib/local-variables";


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
    "image/heic"        // HEIC images
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Create a Zod schema to validate the "file" field
export const ImageSchema = z.instanceof(File)
    .refine((file) => allowedMimeTypes.includes(file.type), {
        message: "Unsupported file type. Allowed types: JPEG, PNG, WebP, SVG, HEIC.",
    })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
        message: "File is too large. Maximum allowed size is 5MB.",
    });


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
    .toLowerCase()
    ;

export const descriptionSchema = z.string()
    .max(500, { message: "Description must be less than 500 characters" });


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




export const ProfileSettingsSchema = z
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

