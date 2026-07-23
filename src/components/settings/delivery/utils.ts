/**
 * @fileoverview Small utility helpers for the delivery settings module.
 *
 * Contains formatTime, which renders an hour/minute pair as a zero-padded
 * HH:MM string, and eurosToCents, which converts euro amounts to integer
 * cents for price inputs.
 */
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
