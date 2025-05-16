'use server';

import { getTranslations } from "next-intl/server";

export async function uploadImage(fileToUpload: File, container: string): Promise<{ url?: string; error?: string }> {
    const t = await getTranslations("app/(store)/components/product-page");
    if (!fileToUpload) {
        return { error: "No file provided for upload." };
    }

    const fd = new FormData();
    fd.append("file", fileToUpload, "image.webp"); // Assuming all images are converted/expected as webp by the backend
    fd.append("container", container);

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload-image`,
            {
                method: "POST",
                body: fd,
                headers: {
                    "Authorization": `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
                },
            }
        );

        if (!response.ok) {
            console.error("Failed to upload image, status:", response.status);
            const errorBody = await response.text();
            console.error("Error body:", errorBody);
            return { error: t("failedUploadImage", { defaultValue: "Failed to upload image."}) };
        }

        const result = await response.json();
        if (!result.url) {
            console.error("Failed to upload image, no URL in response:", result);
            return { error: t("failedUploadImage", { defaultValue: "Failed to retrieve image URL after upload."}) };
        }
        return { url: result.url };
    } catch (error) {
        console.error("Error during image upload:", error);
        return { error: t("failedUploadImage", { defaultValue: "An unexpected error occurred during image upload."}) };
    }
}
