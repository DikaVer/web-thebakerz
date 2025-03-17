// ------------------------
// Data & Types
// ------------------------
import {containerWorkingHours} from "@/db";

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

export async function getScheduleById(itemId: string, partitionKeyValue: string) {
    const { resource: item } = await containerWorkingHours.item(itemId, partitionKeyValue).read();
    return item;
}

