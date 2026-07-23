/**
 * @fileoverview Internationalization configuration declaring supported locales.
 *
 * Lists the seven supported locales (en, nl, fr, de, es, ru, uk), sets English
 * as the default locale, and loads the 'common' translation namespace on every
 * page.
 */

module.exports = {
    locales: ['en', 'nl', 'fr', 'de', 'es', 'ru', 'uk'],
    defaultLocale: 'en',
    pages: {
        '*': ['common'] // Load the 'common' namespace on every page
    }
};