import { storeCreationSchema} from "@/lib/schemas";
import { StoreFormData} from "@/lib/definitions";
import { NextResponse } from "next/server";
import {auth} from "@/auth";
import {fetchStoreName} from "@/lib/actions/store/store-actions";
import {timeMap} from "@/lib/local-variables";
import {sql} from "@vercel/postgres";
import {kv} from "@vercel/kv";

const validateTime = (fromTime: string, toTime: string) => {
    if (fromTime && toTime) {
        if (timeMap[fromTime].from > timeMap[toTime].from) {
            return false;
        }
    }
    return true;
};

// This function will handle saving the address
export async function POST(req: Request) {
    try {
        // Parse the request body since req.body is not available directly
        const body = await req.json();
        const { formData } = body;

        // Validate the input (optional but recommended)
        const validatedStoreData = storeCreationSchema.parse(formData) as StoreFormData;

        const session = await auth()
        // Save the store to the database
        // @ts-ignore
        if (session && session.user?.role == "user") {
            // Check storeName with database
            const storeName = await fetchStoreName(validatedStoreData.storeName);
            if (storeName) {
                return NextResponse.json({ message: 'Store Nickname is already taken' }, { status: 400 });
            }
            // Check Availability of storeName
            for (const [key, availability] of Object.entries(validatedStoreData.availabilityCalendar)) {
                const { from, to } = availability;
                if (!validateTime(from, to)) {
                    return NextResponse.json({ message: 'Invalid time' }, { status: 400 });
                }
            }


            let image = undefined;
            // Upload the background image to the cloud storage
            if (formData.backgroundImage) {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/image/upload/background`, {
                    method: 'POST',
                    headers: { 'content-type': formData.backgroundImage?.type || 'application/octet-stream' },
                    body: formData.backgroundImage,
                })

                if (!response.ok) {
                    throw new Error('Failed to upload image');
                } else {
                    const result = await response.json();
                    image = result.url;
                }
            }

            // Save the store to the database

            const storeRow = await sql`
            INSERT INTO stores (
                "storeName",
                 description,
                "backgroundUrl",
                delivery
            ) VALUES (
                ${validatedStoreData.storeName},
                ${validatedStoreData.description ? validatedStoreData.description : null},
                ${image ? image : null},
                ${validatedStoreData.delivery}
            )`;

            const storeToken = await sql`
                SELECT
                    stores."storeToken"
                FROM stores
                WHERE
                    stores."storeName" = ${validatedStoreData.storeName}
                `;

            const keyAddress = `address-${storeToken.rows[0].storeToken}`;

            await kv.hset(keyAddress, validatedStoreData.address);


            if (Object.keys(validatedStoreData.availabilityCalendar).length !== 0) {
                // Save the availability data to the database
                const keyAvailability = `availabilityCalendar-${storeToken.rows[0].storeToken}`;

                await kv.hset(keyAvailability, validatedStoreData.availabilityCalendar);
            }


            if (validatedStoreData.deliveryLocations.length !== 0) {
                const keyDelivery = `deliveryOptions-${storeToken.rows[0].storeToken}`;

                await kv.lpush(keyDelivery, validatedStoreData.deliveryLocations);
            }


        } else {
            return NextResponse.json({ message: 'Unauthorized access' }, { status: 401 });
        }

        // Respond with a success message
        return NextResponse.json({ message: 'Store was created successfully'}, { status: 200 });
        } catch (error) {
        console.log(error)
            if (error instanceof Error) {
                // If validation fails, Zod throws a `ZodError`
                return NextResponse.json({
                    message: "Validation of receive data is failed",
                    errors: error || [],
                }, { status: 400 });
        }
        // For any other server error
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
