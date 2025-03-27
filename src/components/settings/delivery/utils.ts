import { useTranslations } from "next-intl";
import { DeliverySchedule } from "@/lib/actions/delivery-actions";

/**
 * Format time from hour and minute
 */
export const formatTime = (time: { hour: number; minute: number }): string => {
  return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
};

/**
 * Helper function to convert euros to cents for input handling
 */
export const eurosToCents = (euros: number): number => {
  return Math.round(euros * 100);
};

/**
 * Get a summary of the delivery schedule for display
 */
export const getScheduleSummary = (schedule: DeliverySchedule): string => {
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const whT = useTranslations("Working Hours");
  const t = useTranslations("app/(return_page)/settings/components/delivery-settings");

  const enabledDays = daysOfWeek.filter(day => schedule[day as keyof DeliverySchedule]?.isEnabled);
  
  if (enabledDays.length === 0) return t("noDeliveryDays");
  if (enabledDays.length === 7) return t("deliveryAllWeek");
  
  return enabledDays.map(day => {
    const daySchedule = schedule[day as keyof DeliverySchedule];
    if (!daySchedule) return '';
    return `${whT(day)} ${formatTime(daySchedule.start)}-${formatTime(daySchedule.end)}`;
  }).join(', ');
}; 