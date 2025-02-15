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



        const {session, user} = await getCurrentSession();

        if (!session) {
            return NextResponse.json({
                error: "Not authenticated"
            }, {
                status: 401
            });
        }

        // Convert the file (a web File object) into a Node.js Buffer
        const arrayBuffer = await fileField.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        // Compress and convert the image using Sharp:
        // Resize to 800px width (without enlarging smaller images) and convert to WebP with quality 80.
        const processedBuffer = await sharp(fileBuffer)
            .toFormat("webp", { quality: 50 })
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
                [blobUrl, user?.id]
            );
        }

        return NextResponse.json({ success: "Image updated successfully!", url: blobUrl }, { status: 200 });
    } catch (error) {
        console.error("Error during image upload:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
