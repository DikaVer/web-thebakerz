export const LOCALES = ['en-NL', 'nl', 'fr', 'ru'] as const;
export type Locale = (typeof LOCALES)[number];
