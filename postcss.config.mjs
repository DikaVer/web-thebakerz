/**
 * @fileoverview PostCSS configuration for the build pipeline.
 *
 * Registers the Tailwind CSS plugin so that Tailwind directives and utility
 * classes are processed during compilation.
 */

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;
