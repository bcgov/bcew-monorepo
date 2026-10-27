const { spawnSync } = require( 'node:child_process' );
const { createRequire } = require( 'node:module' );
const path = require( 'node:path' );

const scriptsPackage = require.resolve( '@wordpress/scripts/package.json' );
const scriptsRequire = createRequire( scriptsPackage );
const eslintPackage = scriptsRequire.resolve( 'eslint/package.json' );
const eslintBin = path.resolve(
    path.dirname( eslintPackage ),
    require( eslintPackage ).bin.eslint
);
const args = process.argv.slice( 2 );
const hasFileArgs = scriptsRequire( 'minimist' )( args )._.length > 0;
const result = spawnSync(
    process.execPath,
    [
        eslintBin,
        '--config',
        path.resolve( __dirname, '../eslint.config.js' ),
        ...args,
        ...( hasFileArgs ? [] : [ '.' ] ),
    ],
    {
        env: {
            ...process.env,
            ESLINT_USE_FLAT_CONFIG: 'true',
        },
        stdio: 'inherit',
    }
);

if ( result.error ) {
    throw result.error;
}

process.exitCode = result.status ?? 1;
