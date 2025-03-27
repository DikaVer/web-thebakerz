import { containerWorkingHours } from '@/db';
import {globalGETRateLimit, globalPOSTRateLimit} from '@/lib/actions/requests';
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/actions/session';
import { z } from 'zod';
import { getTranslations } from "next-intl/server";
import {revalidateTag} from "next/cache";

// Define Zod schemas for the nested types.
const timeSchema = z.object({
    hour: z.number(),
    minute: z.number(),
});

const workDaySchema = z.object({
    isEnabled: z.boolean(),
    start: timeSchema,
    end: timeSchema,
});

// Define the work hours schema for each day of the week.
// Using .partial() allows the client to send only some days if desired.
const workHoursSchema = z.object({
    monday: workDaySchema,
    tuesday: workDaySchema,
    wednesday: workDaySchema,
    thursday: workDaySchema,
    friday: workDaySchema,
    saturday: workDaySchema,
    sunday: workDaySchema,
}).partial();

// The request body must contain a "workHours" key.
const requestBodySchema = z.object({
    workHours: workHoursSchema,
});

export const runtime = 'nodejs';

export async function POST(req: Request) {
    const t = await getTranslations("app/api/update-schedule");
    
    // Rate limiting check
    if (!(await globalPOSTRateLimit())) {
        return NextResponse.json({ error: t("tooManyRequests") }, { status: 429 });
    }

    // Extract JSON body from the request
    let body: unknown;
    try {
        body = await req.json();
    } catch (error) {
        return NextResponse.json({ error: t("invalidJson") }, { status: 400 });
    }

    // Validate the request payload using Zod
    const parsedBody = requestBodySchema.safeParse(body);
    if (!parsedBody.success) {
        return NextResponse.json(
            { error: t("invalidPayload"), details: parsedBody.error.flatten() },
            { status: 400 }
        );
    }
    const { workHours } = parsedBody.data;

    // Chech if the schedule is valid start < end
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    for (const day of daysOfWeek) {
        // @ts-ignore
        const daySchedule = workHours[day];
        if (daySchedule) {
            const { start, end } = daySchedule;
            if ((start.hour > end.hour || (start.hour === end.hour && start.minute >= end.minute)) && daySchedule.isEnabled) {
                return NextResponse.json({ error: t("invalidTimeFields") }, { status: 400 });
            }
        }
    }

    // Get the current store from session
    const { store } = await getCurrentSession();
    if (!store) {
        return NextResponse.json({ error: t("storeNotFound") }, { status: 404 });
    }

    try {
        // IMPORTANT: If your Cosmos DB container is partitioned on a property (for example, "storeId"),
        // you need to include it in your document and/or specify it in the upsert options.
        const document = {
            id: store.id,         // Document ID
            store_id: store.id,    // Partition key value (if your container is partitioned on /storeId)
            schedule: workHours,  // The validated schedule data
            updatedAt: new Date().toISOString(),
        };

        const cosmosResponse = await containerWorkingHours.items.upsert(document);

        // Check if the response status indicates a successful upsert.
        if (cosmosResponse.statusCode !== 201 && cosmosResponse.statusCode !== 200) {
            throw new Error('Failed to update schedule');
        }

        revalidateTag('session');
        revalidateTag('store');

        return NextResponse.json(
            { message: 'Schedule updated successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating schedule:', error);
        return NextResponse.json({ error: t("updateFailed") }, { status: 500 });
    }
}
