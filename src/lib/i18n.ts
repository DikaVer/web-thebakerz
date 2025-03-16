export const LOCALES = ['en-NL', 'nl', 'de', 'fr', 'ru'] as const;
export type Locale = (typeof LOCALES)[number];
