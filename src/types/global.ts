import messages from '../../messages/en.json';

declare module 'next-intl' {
  interface AppConfig {
    Messages: typeof messages;
    defaultLocale: 'en';
    locales: ['en', 'nl', 'fr'];
  }
}