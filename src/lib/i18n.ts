export const LOCALES = ['en-NL', 'nl', 'de', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];
