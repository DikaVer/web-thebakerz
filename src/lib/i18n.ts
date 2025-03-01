export const LOCALES = ['en', 'nl', 'de', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];
