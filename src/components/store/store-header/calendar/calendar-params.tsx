
// --- Function to parse a date to numeric date and time strings ---
import {CalendarDateTime} from "@internationalized/date";

export function parseDateTime(
    dateValue: CalendarDateTime | undefined
): { date: string | null; time: string | null } {

    if (!dateValue) {
        return {
            date: null,
            time: null
        };
    }

    return {
        date: `${dateValue.year}-${dateValue.month}-${dateValue.day}`,
        time: `${dateValue.hour}:${dateValue.minute}`
    };
}

export function parseDateParams(
    dateValue: string
): CalendarDateTime | undefined {
    const [date, time] = dateValue.split(" ");
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);

    if (year === undefined || month === undefined || day === undefined || hour === undefined || minute === undefined) {
        return undefined;
    }

    return new CalendarDateTime(year, month, day, hour, minute);
}

export const setCalendarParams = (searchParams: URLSearchParams,  router: any, dateParam: string | null, timeParam: string | null, pathname: string) => {
    const SearchParams = new URLSearchParams(searchParams);
    const calendar = parseDateParams(`${dateParam} ${timeParam}`);
    const {date, time} = parseDateTime(calendar);
    SearchParams.set("date", date?.toString() ?? "");
    SearchParams.set("time", time?.toString() ?? "");
    router.replace(`${pathname}?${SearchParams.toString()}`);
};