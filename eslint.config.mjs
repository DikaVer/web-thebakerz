export default [
    {
        extends: ["next/core-web-vitals"]
    },
    {
        ignores: ['dist/'],
    },
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2021,
        },
        rules: {
            semi: 'error',
        },
    },
];