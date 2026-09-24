import { globSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Validate that `wp:template-part` blocks do not include a `theme` attribute.
 *
 * Why this script exists:
 * - A parent theme that hard-codes `"theme":"<slug>"` on a template-part block
 *   pins that part to itself, so child themes can no longer override it.
 * - Leaf themes (child themes) may legitimately set the attribute, so this check
 *   is opt-in: a project enables it by declaring the `lint-template-parts`
 *   target in its `project.json`.
 *
 * Behavior:
 * - Scans `parts/**\/*.html` and `templates/**\/*.html` under the directory
 *   passed as the first argument (Nx passes `{projectRoot}`), defaulting to cwd.
 * - Exits non-zero and reports `file:line` for every violation found.
 */
const TEMPLATE_GLOBS = [ 'parts/**/*.html', 'templates/**/*.html' ];
const TEMPLATE_PART_BLOCK_REGEX = /<!--\s*wp:template-part\b[\s\S]*?\/-->/g;
const THEME_ATTRIBUTE_REGEX = /"theme"\s*:/;

const projectRoot = process.argv[ 2 ] ?? process.cwd();

const getLineNumber = ( content, index ) =>
    content.slice( 0, index ).split( '\n' ).length;

const files = [
    ...new Set(
        globSync( TEMPLATE_GLOBS, {
            cwd: projectRoot,
            exclude: ( fileName ) =>
                'node_modules' === fileName || 'vendor' === fileName,
        } )
    ),
].sort();

const errors = [];

for ( const file of files ) {
    let content;
    try {
        content = readFileSync( join( projectRoot, file ), 'utf8' );
    } catch ( error ) {
        console.error( `Error reading file ${ file }: ${ error.message }` );
        process.exitCode = 1;
        continue;
    }

    for ( const match of content.matchAll( TEMPLATE_PART_BLOCK_REGEX ) ) {
        if ( THEME_ATTRIBUTE_REGEX.test( match[ 0 ] ) ) {
            errors.push( {
                file,
                line: getLineNumber( content, match.index ),
                message:
                    'Remove the "theme" attribute; child themes cannot override template parts when it is present',
            } );
        }
    }
}

if ( errors.length > 0 ) {
    console.error( '\n❌ Template Part Validation Failed\n' );
    for ( const error of errors ) {
        console.error( `${ error.file }:${ error.line }` );
        console.error( `  ${ error.message }\n` );
    }
    process.exit( 1 );
}

if ( 0 === files.length ) {
    console.warn(
        '⚠️  Warning: No template files found. Please check that parts/ and templates/ directories exist.'
    );
}

console.log(
    `✅ Validated ${ files.length } file(s) - no theme attributes found`
);
