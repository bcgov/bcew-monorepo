const { spawnSync } = require( 'node:child_process' );
const path = require( 'node:path' );

// Shared wp-env settings live in one place so local commands and generators stay aligned.
const config = require( './config.json' );

const [ , , mode, ...args ] = process.argv;
// Support both "... -- arg1 arg2" and direct arg forwarding.
const forwardedArgs = '--' === args[ 0 ] ? args.slice( 1 ) : args;

// Executes child commands from the repo root with optional env overrides,
// then exits with the same status code so CI/scripts behave predictably.
/**
 * @param {string}                 command      Binary to execute.
 * @param {string[]}               commandArgs  Arguments for the command.
 * @param {Record<string, string>} envOverrides Env vars merged for the child process.
 * @return {void}
 */
const runCommand = ( command, commandArgs, envOverrides = {} ) => {
    const result = spawnSync( command, commandArgs, {
        cwd: path.resolve( __dirname, '../..' ),
        env: {
            ...process.env,
            ...envOverrides,
        },
        stdio: 'inherit',
        shell: 'win32' === process.platform,
    } );

    if ( result.error ) {
        throw result.error;
    }

    if ( result.signal ) {
        process.stderr.write(
            `Command "${ command }" was terminated by signal ${ result.signal }.\n`
        );
        process.exit( 1 );
    }

    const exitCode = 'number' === typeof result.status ? result.status : 1;

    process.exit( exitCode );
};

switch ( mode ) {
    case 'wp-env':
        // Runs wp-env using canonical config values instead of per-command manual flags.
        runCommand( 'npx', [ 'wp-env', ...forwardedArgs ], {
            WP_ENV_CORE: config.core,
            WP_ENV_PHP_VERSION: String( config.phpVersion ),
        } );
        break;

    case 'sync':
        // Updates/generated workspace config from the same wp-env source of truth.
        runCommand( 'npx', [
            'nx',
            'generate',
            'monorepo-plugin:sync-wp-env',
            `--core=${ config.core }`,
            `--phpVersion=${ config.phpVersion }`,
            ...forwardedArgs,
        ] );
        break;

    case 'print-config':
        // Handy for debugging in scripts and CI logs.
        process.stdout.write( `${ JSON.stringify( config, null, 4 ) }\n` );
        break;

    default:
        process.stderr.write(
            'Usage:\n' +
                '  node tools/wp-env/cli.js wp-env [wp-env args...]\n' +
                '  node tools/wp-env/cli.js sync [sync generator args...]\n' +
                '  node tools/wp-env/cli.js print-config\n'
        );
        process.exit( 1 );
}
