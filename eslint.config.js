const { createRequire } = require( 'node:module' );
const path = require( 'node:path' );

const lintSeverity = process.env.LINT_SEVERITY ?? 'error';
const wpScriptsPath = require.resolve( '@wordpress/scripts/package.json' );
const wpScriptsRequire = createRequire( wpScriptsPath );
const eslintRequire = createRequire(
    wpScriptsRequire.resolve( 'eslint/package.json' )
);
const { FlatCompat } = eslintRequire( '@eslint/eslintrc' );
const wpScriptsNodeModules = path.resolve(
    path.dirname( wpScriptsPath ),
    '../..'
);
const compat = new FlatCompat( {
    baseDirectory: __dirname,
    resolvePluginsRelativeTo: wpScriptsNodeModules,
} );

module.exports = [
    {
        ignores: [
            '**/build/**',
            '**/node_modules/**',
            '**/vendor/**',
            '**/dist/**',
            '**/coverage/**',
            'tools/monorepo/src/generators/**/files/**',
            'tools/monorepo/src/generators/block/templates/**',
        ],
    },
    ...compat.extends( 'plugin:@wordpress/eslint-plugin/recommended' ),
    ...compat.config( {
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
    } ),
    {
        files: [ '**/*.{ts,tsx,cts,mts}' ],
        rules: {
            'jsdoc/no-undefined-types': 'off',
        },
    },
    {
        files: [ '**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}' ],
        plugins: {
            'prefer-arrow': require( 'eslint-plugin-prefer-arrow' ),
        },
    },
];
