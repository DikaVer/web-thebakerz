/**
 * @fileoverview Server action for validating an order time against a store schedule.
 *
 * Exports validateOrderTimeAgainstSchedule, which checks that a requested
 * order date/time respects the store's minimum lead time and falls within the
 * opening hours defined in its WorkHours schedule for that weekday, returning
 * a validity flag and a human-readable message. Uses @internationalized/date
 * for timezone-aware comparisons.
 */
'use server'

import { CalendarDateTime, getDayOfWeek, getLocalTimeZone, now, Time, toTime, toZoned, ZonedDateTime } from "@internationalized/date";
import { WorkHours } from "./calendar-actions";


// It should validate if the given time is within the schedule and respects lead time.
export async function validateOrderTimeAgainstSchedule(
    orderDateTime: CalendarDateTime,
    schedule: WorkHours | undefined,
    leadTimeMinutes: number
): Promise<{ isValid: boolean; message: string }> {
    if (!schedule) {
        return { isValid: false, message: "Schedule data is missing." };
    }

    const localTimeZone = getLocalTimeZone();
    const nowInLocalTime: ZonedDateTime = now(localTimeZone);
    // Convert the CalendarDateTime to a ZonedDateTime in the local timezone for comparison
    const orderZonedDateTime: ZonedDateTime = toZoned(orderDateTime, localTimeZone);

    // 1. Check Lead Time
    // ------------------
    // Calculate the earliest allowed order time by adding lead time to the current time
    const minimumOrderTime = nowInLocalTime.add({ minutes: leadTimeMinutes });

    if (orderZonedDateTime.compare(minimumOrderTime) <= 0) {
        // Order time is sooner than allowed by lead time
        return {
            isValid: false,
            message: `Order must be placed at least ${leadTimeMinutes} minutes in advance. Earliest time is ${minimumOrderTime.hour}:${String(minimumOrderTime.minute).padStart(2, '0')}.`
        };
    }

    // 2. Check Opening Hours
    // ----------------------
    // Get the day of the week (0=Sunday, 1=Monday, ..., 6=Saturday)
    // Use the orderDateTime (which is timezone-agnostic CalendarDateTime) for day of week calculation
    const dayOfWeek = getDayOfWeek(orderDateTime, 'en-US');  
    const dayNames: (keyof WorkHours)[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = dayNames[dayOfWeek];

    const daySchedule = schedule[dayKey];

    if (!daySchedule || !daySchedule.isEnabled) {
        return { isValid: false, message: `Ordering is not available on ${dayKey}s.` };
    }

    // Convert schedule start/end times and order time to Time objects for comparison
    const scheduleStartTime = new Time(daySchedule.start.hour, daySchedule.start.minute);
    const scheduleEndTime = new Time(daySchedule.end.hour, daySchedule.end.minute);
    // Convert the CalendarDateTime to Time object
    const orderTime = toTime(orderDateTime);

    // Check if order time is within the start and end times for that day
    if (orderTime.compare(scheduleStartTime) < 0 || orderTime.compare(scheduleEndTime) > 0) {
        // If order time is before start OR after end time
        return {
            isValid: false,
            message: `Order time (${orderTime.hour}:${String(orderTime.minute).padStart(2, '0')}) is outside opening hours (${scheduleStartTime.hour}:${String(scheduleStartTime.minute).padStart(2, '0')} - ${scheduleEndTime.hour}:${String(scheduleEndTime.minute).padStart(2, '0')}) for ${dayKey}.`
        };
    }

    // 3. Optional: Check against specific date exceptions (if you have ExDay logic)
    // If you store specific date overrides (e.g., holidays), you would check them here.
    // Example: const exception = findExceptionForDate(orderDateTime.toDate(getLocalTimeZone()));
    // if (exception && !exception.isEnabled) { return { isValid: false, message: "Store is closed on this specific date." }; }
    // if (exception && (orderTime < exception.start || orderTime >= exception.end)) { ... }

    // If all checks pass
    return { isValid: true, message: "Order time is valid." };
}
