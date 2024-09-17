import * as z from "zod";

import {storeCreationSchema} from "@/lib/schemas";

export const createStore = async (formData: z.infer<typeof storeCreationSchema>) => {
    // Validate the fields in the form using the LoginSchema
    const validateFields = storeCreationSchema.safeParse(formData);

    // If validation fails, return an error message
    if (!validateFields.success) {
        return {
            error: validateFields.error
        };
    }

};