import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Synchronize package-local docs into the root VitePress content tree.
 *
 * Why this script exists:
 * - Docs are authored close to code in `plugins/<slug>/docs` and `themes/<slug>/docs`.
 * - VitePress builds a single site from the root `docs/` directory.
 * - This script copies package docs into generated `docs/content/...` paths
 *   before `docs:dev` and `docs:build`.
 *
 * Behavior:
 * - Deletes and recreates `docs/content/` on each run (prevents stale files).
 * - Copies all plugin/theme docs folders into namespaced output directories.
 * - Skips packages that do not contain a `docs/` folder.
 * - Copies every file as-is, including topic pages under `user/` and `developer/`;
 *   the VitePress config lists user topics directly and groups developer topics.
 */
// Centralized docs output consumed by the root VitePress site.
const repoRoot = resolve( import.meta.dirname, '..' );
const outputRoot = resolve( repoRoot, 'docs', 'content' );

// Package groups that can contain package-local docs folders.
const packageDirs = [
    { sourceRoot: 'plugins', outRoot: 'plugins' },
    { sourceRoot: 'themes', outRoot: 'themes' },
];

/**
 * Copy all package docs within a source group (plugins/themes) to output.
 *
 * @param {string} sourceRoot Relative monorepo path containing package folders.
 * @param {string} outRoot    Relative output segment under `docs/content`.
 */
const syncDocsForGroup = ( sourceRoot, outRoot ) => {
    const baseDir = resolve( repoRoot, sourceRoot );
    const packageNames = readdirSync( baseDir, { withFileTypes: true } )
        .filter( ( entry ) => entry.isDirectory() )
        .map( ( entry ) => entry.name );

    for ( const packageName of packageNames ) {
        const sourceDocs = resolve( baseDir, packageName, 'docs' );
        // Skip packages that do not have docs yet.
        if ( ! existsSync( sourceDocs ) ) {
            continue;
        }

        const outputDir = resolve( outputRoot, outRoot, packageName );
        mkdirSync( outputDir, { recursive: true } );
        // Copy package docs into generated VitePress content.
        cpSync( sourceDocs, outputDir, { recursive: true, force: true } );
    }
};

// Remove old generated docs so deleted/renamed files do not linger.
rmSync( outputRoot, { recursive: true, force: true } );
mkdirSync( outputRoot, { recursive: true } );

for ( const group of packageDirs ) {
    syncDocsForGroup( group.sourceRoot, group.outRoot );
}

console.log( 'Docs sync complete.' );
