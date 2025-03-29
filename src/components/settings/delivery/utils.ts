import { useTranslations } from "next-intl";

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
