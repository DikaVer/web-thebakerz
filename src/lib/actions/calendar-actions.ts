'use server';
// ------------------------
// Data & Types
// ------------------------
import {containerWorkingHours} from "@/db";
import { getCurrentSession } from '@/lib/actions/session';
import { z } from 'zod';
import { getTranslations } from "next-intl/server";
import {revalidateTag} from "next/cache";
import {globalPOSTRateLimit} from '@/lib/utils/helper/requests';

export interface Time {
    hour: number;
    minute: number;
}
export interface Day {
    day: number;
    month: number;
    year: number;
}

export interface WorkDay {
    isEnabled: boolean;
    start: Time;
    end: Time;
}

export interface ExDay {
    dateKey: {
        isEnabled: boolean,
        start: Time,
        end: Time,
        date: Day
    }
}

export interface WorkHours {
    monday: WorkDay;
    tuesday: WorkDay;
    wednesday: WorkDay;
    thursday: WorkDay;
    friday: WorkDay;
    saturday: WorkDay;
    sunday: WorkDay;
}

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

export async function updateSchedule(workHours: Partial<WorkHours>, storeId: string) {
    'use server';
    
    const t = await getTranslations("app/api/update-schedule");
    
    // Rate limiting check
    if (!(await globalPOSTRateLimit())) {
        return { success: false, error: t("tooManyRequests"), status: 429 };
    }

    // Validate the payload using Zod
    const parsedWorkHours = workHoursSchema.safeParse(workHours);
    if (!parsedWorkHours.success) {
        return { 
            success: false, 
            error: t("invalidPayload"), 
            details: parsedWorkHours.error.flatten(),
            status: 400 
        };
    }

    // Check if the schedule is valid start < end
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    for (const day of daysOfWeek) {
        // @ts-ignore
        const daySchedule = workHours[day];
        if (daySchedule) {
            const { start, end } = daySchedule;
            if ((start.hour > end.hour || (start.hour === end.hour && start.minute >= end.minute)) && daySchedule.isEnabled) {
                return { success: false, error: t("invalidTimeFields"), status: 400 };
            }
        }
    }

    // Get the current store from session
    const { user, stores } = await getCurrentSession();
    const store = stores?.find(store => store.id === storeId);
    if (!user || !store) {
        return { success: false, error: t("storeNotFound"), status: 404 };
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

        revalidateTag('store', 'max');

        return { success: true, message: 'Schedule updated successfully' };
    } catch (error) {
        console.error('Error updating schedule:', error);
        return { success: false, error: t("updateFailed"), status: 500 };
    }
}

export async function getScheduleById(itemId: string, partitionKeyValue: string) {
    const { resource: item } = await containerWorkingHours.item(itemId, partitionKeyValue).read();
    return item;
}

