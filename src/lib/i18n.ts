export const LOCALES = ['en-NL', 'nl', 'fr', 'ru', 'de', 'uk', 'es'] as const;
export type Locale = (typeof LOCALES)[number];
