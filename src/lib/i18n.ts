export const LOCALES = ['en-NL', 'nl', 'de', 'fr', 'ru', 'ro', 'es', 'uk'] as const;
export type Locale = (typeof LOCALES)[number];
