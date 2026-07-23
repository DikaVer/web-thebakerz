/**
 * @fileoverview Internationalization constants for the application.
 *
 * Defines the LOCALES tuple of supported locale codes and the derived Locale
 * union type used throughout the app for translation and routing.
 */
export const LOCALES = ['en', 'en-NL', 'nl', 'fr', 'ru', 'de', 'uk', 'es'] as const;
export type Locale = (typeof LOCALES)[number];
