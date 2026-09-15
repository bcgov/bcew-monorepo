#!/usr/bin/env node
/**
 * CLI wrapper around next-release-version.mjs.
 *
 * The Tag workflow calls this so it can pass a concrete version into
 * `nx release`. The first argument is the Nx project name (for example
 * bcew-blocks). The second is "true" when the Alpha checkbox is ticked.
 *
 * Git tags for a project are named {project}/v{version}. This script lists
 * those tags, strips the prefix, and prints the next version on stdout.
 * Nx and the rest of the Action read only that one line. Progress messages
 * go to stderr so they show in the log without becoming the version.
 *
 * Usage: node next-release-version-cli.mjs <project-name> <true|false>
 */

import { execFileSync } from 'node:child_process';
import { nextReleaseVersion } from './next-release-version.mjs';

const project = process.argv[ 2 ];
const isAlpha = process.argv[ 3 ] === 'true';

if ( ! project ) {
	console.error( 'Usage: next-release-version-cli.mjs <project-name> <true|false>' );
	process.exit( 1 );
}

/*
 * List tags for this project only. The prefix includes the slash and "v"
 * so bcew-blocks/v1.0.0 becomes 1.0.0 after the slice. fetch-depth: 0 on
 * checkout is required; a shallow clone would miss older tags.
 */
const prefix = `${ project }/v`;
const raw = execFileSync( 'git', [ 'tag', '-l', `${ prefix }*` ], {
	encoding: 'utf8',
} );
const tags = raw
	.split( '\n' )
	.map( ( line ) => line.trim() )
	.filter( Boolean )
	.map( ( tag ) => ( tag.startsWith( prefix ) ? tag.slice( prefix.length ) : tag ) );

const version = nextReleaseVersion( tags, isAlpha );
if ( 0 === tags.length ) {
	console.error( `No ${ prefix }* tags; starting at ${ version }` );
} else {
	console.error( `Latest ${ project } tag version: ${ tags.join( ', ' ) } → ${ version }` );
}

/*
 * stdout is the version the Action captures. Keep it to a single line with
 * no extra text.
 */
process.stdout.write( `${ version }\n` );
