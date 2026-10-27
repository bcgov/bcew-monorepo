import { existsSync, globSync, readFileSync } from 'node:fs';

/**
 * Enforce the BCEW .gitattributes standard.
 *
 * The canonical file is the plugin generator copy. Every tracked plugin/theme
 * (a directory with a package.json) and both generator copies must contain every
 * canonical `export-ignore` rule. Extra rules are allowed.
 */
const CANONICAL = 'tools/monorepo/src/generators/plugin/files/.gitattributes';

const rules = ( file ) =>
    readFileSync( file, 'utf8' )
        .split( /\r?\n/ )
        .map( ( line ) => line.trim().split( /\s+/ ).join( ' ' ) )
        .filter( ( line ) => line && ! line.startsWith( '#' ) );

const required = rules( CANONICAL );
const targets = [
    'tools/monorepo/src/generators/theme/files/.gitattributes',
    ...globSync( [ 'plugins/*/package.json', 'themes/*/package.json' ] ).map(
        ( pkg ) => pkg.replace( /package\.json$/, '.gitattributes' )
    ),
];

let failed = false;
for ( const target of targets ) {
    if ( ! existsSync( target ) ) {
        console.error( `${ target }: missing` );
        failed = true;
        continue;
    }
    const present = new Set( rules( target ) );
    const missing = required.filter( ( rule ) => ! present.has( rule ) );
    if ( missing.length ) {
        console.error(
            `${ target }: missing rules: ${ missing.join( ', ' ) }`
        );
        failed = true;
    }
}

process.exit( failed ? 1 : 0 );
