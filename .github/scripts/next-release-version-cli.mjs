#!/usr/bin/env node
/**
 * Print the next release version for an Nx project from its git tags.
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
process.stdout.write( `${ version }\n` );
