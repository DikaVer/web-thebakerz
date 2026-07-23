/**
 * @fileoverview API route handling POST /api/upload-image, which uploads and processes user images.
 *
 * Accepts multipart form data with a file and a target container name (avatars, products,
 * or background), validates the image with Zod and Sharp, converts it to WebP, and uploads
 * it to the corresponding Azure Blob Storage container. Authenticates via either the shared
 * bearer secret or the current user session; avatar uploads also update the user's image URL
 * in PostgreSQL. Runs in the Node.js runtime because it depends on Sharp.
 */
import { NextResponse } from "next/server";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import {connectionPool, containerClientAvatar, containerClientProduct, containerClientBackground} from "@/db";
import {globalPOSTRateLimit} from "@/lib/utils/helper/requests";
import {getCurrentSession} from "@/lib/actions/session";
import {ImageSchema} from "@/lib/utils/schemas";
import { getTranslations } from "next-intl/server";


// Ensure the API route runs in the Node.js runtime so we can use Sharp
export const runtime = "nodejs";


export async function POST(request: Request) {
    const t = await getTranslations("app/api/upload-image");
    
    try {
        if (!await globalPOSTRateLimit()) {
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

        let containerClient;
        // Identify the container
        if (containerName === "avatars") {
            containerClient = containerClientAvatar;
        } else if (containerName === "products") {
            containerClient = containerClientProduct;
        } else if (containerName === "background") {
            containerClient = containerClientBackground;
        } else {
            return NextResponse.json(
                { error: t("invalidContainer") },
                { status: 400 }
            );
        }

        try {
            const metadata = await sharp(fileBuffer).metadata();
            // Accept any valid image format now
            if (!metadata.format) {
                throw new Error('Invalid image format detected server-side.');
            }
            
            // Log the format and dimensions for debugging
            // console.log(`Server received image: ${metadata.format}, ${metadata.width}x${metadata.height}px, ${fileBuffer.length} bytes`);
            
            // Optional: Perform additional security checks if needed
            // For example, reject extremely large dimensions that could cause memory issues
            const MAX_DIMENSION = 15000; // Maximum reasonable dimension
            if ((metadata.width && metadata.width > MAX_DIMENSION) || 
                (metadata.height && metadata.height > MAX_DIMENSION)) {
                throw new Error(`Image dimensions too large (max: ${MAX_DIMENSION}px)`);
            }
            
            // Process, compress and convert to WebP
            let processedBuffer;
            if (metadata.format !== "webp") {
                processedBuffer = await sharp(fileBuffer)
                    .webp({ quality: 95 }) // Convert to WebP with good quality
                    .toBuffer();
            } else {
                processedBuffer = fileBuffer;
            }
                
            // console.log(`Converted to WebP: original=${fileBuffer.length} bytes, webp=${processedBuffer.length} bytes`);
            
            // Generate a unique file name (with .webp extension)
            const uniqueFileName = `${uuidv4()}.webp`;

            // Get a block blob client and upload the processed image
            const blockBlobClient = containerClient.getBlockBlobClient(uniqueFileName);
            await blockBlobClient.uploadData(processedBuffer, {
                blobHTTPHeaders: { blobContentType: "image/webp" },
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
            
        } catch (validationError) {
            console.error("Server-side image validation failed:", validationError);
            return NextResponse.json({ error: t("invalidImage") }, { status: 400 });
        }
    } catch (error) {
        console.error("Error during image upload:", error);
        return NextResponse.json({ error: t("internalError") }, { status: 500 });
    }
}
