import { NextResponse } from "next/server";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import {connectionPool, containerClientAvatar, containerClientProduct} from "@/db";
import {globalGETRateLimit} from "@/lib/actions/requests";
import {getCurrentSession} from "@/lib/actions/session";
import {ImageSchema} from "@/lib/schemas";
import { getTranslations } from "next-intl/server";


// Ensure the API route runs in the Node.js runtime so we can use Sharp
export const runtime = "nodejs";

// Maximum file size limit (2MB for regular images, 5MB for HEIC/HEIF)
const MAX_FILE_SIZE = {
    default: 2 * 1024 * 1024, // 2MB in bytes
    heic: 5 * 1024 * 1024,    // 5MB for HEIC/HEIF formats
};

export async function POST(request: Request) {
    const t = await getTranslations("app/api/upload-image");
    
    try {
        if (!await globalGETRateLimit()) {
            return NextResponse.json({
                error: t("tooManyRequests")
            }, {
                status: 429
            });
        }

        // Parse the incoming form data
        const formData = await request.formData();
        const fileField = formData.get("file");
        const containerName = formData.get("container");

        if (!fileField || !(fileField instanceof File) || !containerName) {
            return NextResponse.json(
                { error: t("fileNotProvided") },
                { status: 400 }
            );
        }

        // Check file size limit based on format
        const isHeicFormat = fileField.type.toLowerCase().includes('heic') || 
                           fileField.type.toLowerCase().includes('heif');
        const sizeLimit = isHeicFormat ? MAX_FILE_SIZE.heic : MAX_FILE_SIZE.default;

        if (fileField.size > sizeLimit) {
            return NextResponse.json(
                { 
                    error: `File size exceeds the maximum limit of ${sizeLimit / (1024 * 1024)}MB` 
                },
                { status: 400 }
            );
        }

        // Validate the file using Zod
        const fileValidation = ImageSchema.safeParse(fileField);
        if (!fileValidation.success) {
            return NextResponse.json(
                { error: fileValidation.error.errors[0].message },
                { status: 400 }
            );
        }

        const authHeader = request.headers.get('Authorization');
        let userId;

        if (authHeader) {
            const token = authHeader.replace('Bearer ', '').trim();
            if (token !== process.env.NEXT_PRIVATE_SECRET_BEARER) {
                return NextResponse.json(
                    {error: t("notAuthorized")},
                    {status: 401}
                );
            }
        } else {

            const { user } = await getCurrentSession();

            if (!user) {
                return NextResponse.json({
                    error: t("notAuthenticated")
                }, {
                    status: 401
                });
            }

            userId = user.id;
        }

        // Convert the file (a web File object) into a Node.js Buffer
        const arrayBuffer = await fileField.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        try {
            const metadata = await sharp(fileBuffer).metadata();
            // Accept any valid image format now
            if (!metadata.format) {
                throw new Error('Invalid image format detected server-side.');
            }
            
            // Log the format and dimensions for debugging
            if (process.env.NODE_ENV !== 'production') {
                console.log(`Server received image: ${metadata.format}, ${metadata.width}x${metadata.height}px, ${fileBuffer.length} bytes`);
            }
            
            // Optional: Perform additional security checks if needed
            // For example, reject extremely large dimensions that could cause memory issues
            const MAX_DIMENSION = 15000; // Maximum reasonable dimension
            if ((metadata.width && metadata.width > MAX_DIMENSION) || 
                (metadata.height && metadata.height > MAX_DIMENSION)) {
                throw new Error(`Image dimensions too large (max: ${MAX_DIMENSION}px)`);
            }
        } catch (validationError) {
            if (process.env.NODE_ENV !== 'production') {
                console.error("Server-side image validation failed:", validationError);
            }
            return NextResponse.json({ error: t("invalidImage") }, { status: 400 });
        }

        let containerClient;
        // Ensure the container exists (this call is idempotent)
        if (containerName === "avatars") {
            containerClient = containerClientAvatar;
        } else if (containerName === "products") {
            containerClient = containerClientProduct;
        } else {
            return NextResponse.json(
                { error: t("invalidContainer") },
                { status: 400 }
            );
        }

        // Generate a unique file name (with .webp extension)
        const uniqueFileName = `${uuidv4()}.webp`;

        // Get a block blob client and upload the processed image (which is now the original buffer)
        const blockBlobClient = containerClient.getBlockBlobClient(uniqueFileName);
        await blockBlobClient.uploadData(fileBuffer, { // Upload the original buffer directly
            blobHTTPHeaders: { blobContentType: "image/webp" }, // Asserting content type based on client validation
        });

        // Retrieve the URL of the uploaded blob
        const blobUrl = blockBlobClient.url;


        if (containerName === "avatars") {
            await connectionPool.query(
                `UPDATE users SET image = $1 WHERE id = $2`,
                [blobUrl, userId]
            );
        }

        return NextResponse.json({ success: t("imageUpdated"), url: blobUrl }, { status: 200 });
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error("Error during image upload:", error);
        }
        return NextResponse.json({ error: t("internalError") }, { status: 500 });
    }
}
