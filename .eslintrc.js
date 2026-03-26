/**
 * The "global" error severity level. The user can specify that they only want to be
 * warned of linter issues.
 */
const lintSeverity = process.env.LINT_SEVERITY ?? 'error';

module.exports = {
    root: true,
    // React rules used for Gutenberg
    extends: [ 'plugin:@wordpress/eslint-plugin/recommended' ],
    env: {
        node: true,
        es6: true,
        amd: true,
        browser: true,
        jquery: true,
        jest: true,
    },
    globals: {
        wp: true,
    },
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
            globalReturn: true,
            generators: false,
            objectLiteralDuplicateProperties: false,
            experimentalObjectRestSpread: true,
        },
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    // React plugin used for Gutenberg
    plugins: [ 'react', 'jsdoc', 'prefer-arrow' ],
    rules: {
        'no-console': 'production' === process.env.NODE_ENV ? 2 : 0,
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'comma-dangle': [
            lintSeverity,
            {
                arrays: 'always-multiline',
                objects: 'always-multiline',
                imports: 'always-multiline',
                exports: 'always-multiline',
                functions: 'ignore',
            },
        ],
        'no-var': lintSeverity,
        yoda: [ lintSeverity, 'always', { onlyEquality: true } ],
        'prefer-arrow/prefer-arrow-functions': lintSeverity,
        'jsdoc/require-jsdoc': lintSeverity,
        'jsdoc/require-param': lintSeverity,
        'jsdoc/require-param-description': lintSeverity,
        'jsdoc/require-param-name': lintSeverity,
        'jsdoc/require-param-type': lintSeverity,
        'jsdoc/require-returns': lintSeverity,
        // Todo: Fix this rule to accept project-level imports.
        'import/no-extraneous-dependencies': [
            'warn',
            {
                devDependencies: [ '**/*.spec.ts', '**/*.spec.js' ],
                packageDir: [ '.', './themes/*', './plugins/*' ],
            },
        ],
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    ignorePatterns: [
        '**/dist/**',
        '**/coverage/**',
        'tools/monorepo-plugin/src/generators/**/files/**',
        '{plugins,themes}/**/build/**',
    ],
};
