// eslint.config.js
export default [
    {
        files: ["**/*.{js}"],
        languageOptions: {
            // Tell ESLint which ECMAScript version you’re using
            ecmaVersion: 2021,
            sourceType: "module",
        },
        // Instead of "extends", you now import and include shareable configs directly.
        // If you have configs available in flat format, you can include them here.
        rules: {
            "no-unused-vars": "error",

            // semi: 'error',
            // ...other custom rules
        },
    },
];

