#!/usr/bin/env node

const fs = require( 'fs' );
const path = require( 'path' );
const { execSync } = require( 'child_process' );

const THEME_SLUG = 'design-system-wordpress-child-theme-hporoo';
const STARTER_DB_FILE = 'db/starter.sql';
const starterDbPath = path.resolve( __dirname, '../db/starter.sql' );

/**
 * Run a WP-CLI command against a wp-env environment.
 *
 * @param {string} environment wp-env target, such as cli or tests-cli.
 * @param {string} command WP-CLI arguments to run.
 */
const wp = ( environment, command ) => {
    execSync( `npx wp-env run ${ environment } wp ${ command }`, {
        stdio: 'inherit',
    } );
};

/**
 * Activate the theme and import the starter database for a wp-env target.
 *
 * @param {string} label Friendly label for log output.
 * @param {string} environment wp-env target, such as cli or tests-cli.
 */
const bootstrapEnvironment = ( label, environment ) => {
    console.log( `Bootstrapping ${ label } environment...` );
    wp( environment, `theme activate "${ THEME_SLUG }"` );

    if ( fs.existsSync( starterDbPath ) ) {
        wp( environment, `db import "${ STARTER_DB_FILE }"` );
        return;
    }

    console.warn(
        `Skipping DB import for ${ label }: ${ STARTER_DB_FILE } was not found.`
    );
};

bootstrapEnvironment( 'dev', 'cli' );
bootstrapEnvironment( 'tests', 'tests-cli' );

console.log( `Local bootstrap complete for ${ THEME_SLUG }` );
