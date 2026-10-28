import wordpress from '@wordpress/eslint-plugin';
import preferArrow from 'eslint-plugin-prefer-arrow';
import { createRequire } from 'node:module';

const wordpressConfig = wordpress.configs.recommended;

const lintSeverity = process.env.LINT_SEVERITY ?? 'error';
const globals = createRequire(
    import.meta.resolve( '@wordpress/eslint-plugin' )
)( 'globals' );

export default [
    {
        ignores: [
            '**/build/**',
            '**/node_modules/**',
            '**/vendor/**',
            '**/dist/**',
            '**/coverage/**',
            '**/.vitepress/cache/**',
            'tools/monorepo/src/generators/**/files/**',
            'tools/monorepo/src/generators/block/templates/**',
        ],
    },
    ...wordpressConfig,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.amd,
                ...globals.browser,
                ...globals.jquery,
                ...globals.jest,
                wp: 'writable',
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                    globalReturn: true,
                    generators: false,
                    objectLiteralDuplicateProperties: false,
                    experimentalObjectRestSpread: true,
                },
                ecmaVersion: 2022,
                sourceType: 'module',
            },
        },
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
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    {
        files: [ '**/*.{ts,tsx,cts,mts}' ],
        rules: {
            'jsdoc/no-undefined-types': 'off',
        },
    },
    {
        files: [ '**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}' ],
        plugins: {
            'prefer-arrow': preferArrow,
        },
    },
];
