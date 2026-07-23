/**
 * @fileoverview ESLint flat configuration for the project.
 *
 * Combines the Next.js Core Web Vitals and TypeScript rule presets and globally
 * ignores build output directories (.next, out, build) and the generated
 * next-env.d.ts file.
 */

import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
])

export default eslintConfig
