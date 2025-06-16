import { WorkHours } from "@/lib/actions/calendar-actions";
import { now } from "@internationalized/date";


// Format date to YYYY-M-D format (without zero-padding)
export const formatDateToString = (date: Date): string => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};


// Get the last hours of the store for today in Amsterdam timezone
export const getLastStoreHoursToday = (schedule: WorkHours): { date: string; time: string } => {
    const nowInAmsterdam = now("Europe/Amsterdam");
    const today = nowInAmsterdam.toDate();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Europe/Amsterdam' }).toLowerCase() as keyof WorkHours;
    
    // Get today's schedule
    const todaySchedule = schedule[dayOfWeek];
    
    if (!todaySchedule || !todaySchedule.isEnabled) {
        // If today is closed, find the next available day
        const daysOrder: (keyof WorkHours)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const todayIndex = daysOrder.indexOf(dayOfWeek);
        
        for (let i = 1; i <= 7; i++) {
            const nextDayIndex = (todayIndex + i) % 7;
            const nextDay = daysOrder[nextDayIndex];
            const nextDaySchedule = schedule[nextDay];
            
            if (nextDaySchedule && nextDaySchedule.isEnabled) {
                const nextDate = new Date(today);
                nextDate.setDate(today.getDate() + i);
                return {
                    date: formatDateToString(nextDate),
                    time: `${nextDaySchedule.end.hour.toString().padStart(2, '0')}:${nextDaySchedule.end.minute.toString().padStart(2, '0')}`
                };
            }
        }
        
        // Fallback if no days are enabled
        return {
            date: formatDateToString(today),
            time: "23:59"
        };
    }
    
    return {
        date: formatDateToString(today),
        time: `${todaySchedule.end.hour.toString().padStart(2, '0')}:${todaySchedule.end.minute.toString().padStart(2, '0')}`
    };
};
// Helper function to check if current time is within 45 minutes of closing
export const isWithinClosingWindow = (schedule: WorkHours | undefined): boolean => {
    if (!schedule) return false;

    // Get current date and time
    const now = new Date().toLocaleString("en-US", { timeZone: "Europe/Amsterdam" });
    const amsterdamDate = new Date(now);
    const currentDay = amsterdamDate.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const currentHour = amsterdamDate.getHours();
    const currentMinute = amsterdamDate.getMinutes();

    // Map day number to day name
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = dayNames[currentDay] as keyof WorkHours;

    // Get today's schedule
    const todaySchedule = schedule[todayName];

    // Check if the store is enabled today
    if (!todaySchedule?.isEnabled) return false;

    // Convert current time to minutes for easier calculation
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // Get end time in minutes
    const endTimeInMinutes = todaySchedule.end.hour * 60 + todaySchedule.end.minute;

    // Calculate the range: endTime - 45 minutes to endTime
    const rangeStartInMinutes = endTimeInMinutes - 45;

    // Check if current time is within the range
    return currentTimeInMinutes >= rangeStartInMinutes && currentTimeInMinutes <= endTimeInMinutes;
};

// Helper function to calculate time remaining until store closes
export const getTimeUntilClosing = (schedule: WorkHours | undefined): {
    timeRemaining: number; // in minutes
    totalWindow: number; // total window in minutes (45 minutes)
    percentage: number; // percentage of time remaining (0-100)
    hours: number;
    minutes: number;
    seconds: number;
    isActive: boolean;
} | null => {
    if (!schedule) return null;

    // Get current date and time in Amsterdam timezone
    const now = new Date().toLocaleString("en-US", { timeZone: "Europe/Amsterdam" });
    const amsterdamDate = new Date(now);
    const currentDay = amsterdamDate.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const currentHour = amsterdamDate.getHours();
    const currentMinute = amsterdamDate.getMinutes();
    const currentSecond = amsterdamDate.getSeconds();

    // Map day number to day name
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = dayNames[currentDay] as keyof WorkHours;

    // Get today's schedule
    const todaySchedule = schedule[todayName];

    // Check if the store is enabled today
    if (!todaySchedule?.isEnabled) return null;

    // Convert current time to seconds for more precise calculation
    const currentTimeInSeconds = currentHour * 3600 + currentMinute * 60 + currentSecond;

    // Get end time in seconds
    const endTimeInSeconds = todaySchedule.end.hour * 3600 + todaySchedule.end.minute * 60;

    // Calculate the range: endTime - 45 minutes to endTime
    const rangeStartInSeconds = endTimeInSeconds - (45 * 60); // 45 minutes in seconds
    const totalWindow = 45; // 45 minutes total window

    // Check if we're within the closing window
    const isActive = currentTimeInSeconds >= rangeStartInSeconds && currentTimeInSeconds <= endTimeInSeconds;
    
    if (!isActive) return null;

    // Calculate time remaining in seconds
    const timeRemainingInSeconds = Math.max(0, endTimeInSeconds - currentTimeInSeconds);
    
    // Convert to minutes for backward compatibility
    const timeRemainingInMinutes = Math.ceil(timeRemainingInSeconds / 60);
    
    // Calculate percentage (inverted so it shows progress toward ending)
    const percentage = Math.max(0, (timeRemainingInSeconds / (totalWindow * 60)) * 100);
    
    // Convert to hours, minutes, and seconds
    const hours = Math.floor(timeRemainingInSeconds / 3600);
    const minutes = Math.floor((timeRemainingInSeconds % 3600) / 60);
    const seconds = timeRemainingInSeconds % 60;

    return {
        timeRemaining: timeRemainingInMinutes, // Keep for backward compatibility
        totalWindow,
        percentage,
        hours,
        minutes,
        seconds,
        isActive: true
    };
};