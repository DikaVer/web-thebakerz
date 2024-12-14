export default [
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