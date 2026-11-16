const { createRequire } = require( 'node:module' );
const path = require( 'node:path' );

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
        rules: {
            'no-console': 'production' === process.env.NODE_ENV ? 2 : 0,
        },
    } ),
    {
        files: [ '**/*.{ts,tsx,cts,mts}' ],
        rules: {
            'jsdoc/no-undefined-types': 'off',
        },
    },
];
