import { NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import {connectionPool, containerClientAvatar, containerClientProduct} from "@/db";
import {globalGETRateLimit} from "@/lib/actions/requests";
import {getCurrentSession} from "@/lib/actions/session";
import {ImageSchema} from "@/lib/schemas";


// Ensure the API route runs in the Node.js runtime so we can use Sharp
export const runtime = "nodejs";

export async function POST(request: Request) {
    try {

        if (!await globalGETRateLimit()) {
            return NextResponse.json({
                error: "Too many requests"
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
                { error: "File not provided" },
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
                    {error: 'Not Authorize Access'},
                    {status: 401}
                );
            }
        } else {

            const { user } = await getCurrentSession();

            if (!user) {
                return NextResponse.json({
                    error: "Not authenticated"
                }, {
                    status: 401
                });
            }

            userId = user.id;
        }

        // Convert the file (a web File object) into a Node.js Buffer
        const arrayBuffer = await fileField.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);


        // Process the image with Sharp, handling EXIF orientation
        const processedBuffer = await sharp(fileBuffer, {
            // Ensure we can handle large images
            limitInputPixels: 50000000 // Set a reasonable pixel limit
        })
            .rotate() // Auto-rotate based on EXIF orientation
            .withMetadata() // Keep EXIF data
            .resize({
                width: 1200,
                height: 1200,
                fit: 'inside',
                withoutEnlargement: true
            })
            .toFormat("webp", { quality: 80 })
            .toBuffer();


        let containerClient;
        // Ensure the container exists (this call is idempotent)
        if (containerName === "avatars") {
            await containerClientAvatar.createIfNotExists();
            containerClient = containerClientAvatar;
        } else if (containerName === "products") {
            await containerClientProduct.createIfNotExists();
            containerClient = containerClientProduct;
        } else {
            return NextResponse.json(
                { error: "Invalid container name" },
                { status: 400 }
            );
        }

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

        return NextResponse.json({ success: "Image updated successfully!", url: blobUrl }, { status: 200 });
    } catch (error) {
        console.error("Error during image upload:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
