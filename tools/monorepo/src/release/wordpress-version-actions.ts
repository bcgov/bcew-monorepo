/**
 * Custom Nx Release version actions for WordPress plugins and themes.
 *
 * Git tags are the authoritative source for released versions.
 *
 * During versioning, Nx provides the calculated new version to
 * updateProjectVersion(). This action writes that version only to the
 * archived WordPress plugin or theme Version header.
 *
 * Source files, package.json, composer.json, and dependency ranges are
 * not modified.
 */

import { joinPathFragments, type Tree } from '@nx/devkit';

// Nx is installed at the workspace root.
// eslint-disable-next-line import/no-extraneous-dependencies
import { VersionActions } from 'nx/release';

const WORDPRESS_HEADER_SIZE = 8 * 1024;

const VERSION_HEADER_PATTERN =
    /^([ \t]*(?:<\?(?:php)?)?[ \t/*#@]*Version:[ \t]*)([^\r\n]*)/im;

const PLUGIN_NAME_HEADER_PATTERN =
    /^[ \t]*(?:<\?(?:php)?)?[ \t/*#@]*Plugin Name:[ \t]*[^\r\n]+/im;

const THEME_NAME_HEADER_PATTERN = /^[ \t/*#@]*Theme Name:[ \t]*[^\r\n]+/im;

/**
 * Read a text file from the Nx virtual filesystem.
 *
 * @param {Tree}   tree     Nx virtual filesystem.
 * @param {string} filePath Workspace-relative file path.
 * @return {string} File contents.
 */
const readTextFile = ( tree: Tree, filePath: string ): string => {
    const contents = tree.read( filePath, 'utf-8' );

    if ( null === contents ) {
        throw new Error( `Release file does not exist: ${ filePath }` );
    }

    return contents;
};

/**
 * Check whether a file contains a WordPress header within its first 8 KB.
 *
 * @param {Tree}   tree     Nx virtual filesystem.
 * @param {string} filePath Workspace-relative file path.
 * @param {RegExp} pattern  Header pattern.
 * @return {boolean} Whether the header exists.
 */
const containsWordPressHeader = (
    tree: Tree,
    filePath: string,
    pattern: RegExp
): boolean => {
    if ( ! tree.exists( filePath ) ) {
        return false;
    }

    const contents = readTextFile( tree, filePath );
    const header = contents.slice( 0, WORDPRESS_HEADER_SIZE );

    return pattern.test( header );
};

/**
 * Find the WordPress plugin entry point or theme stylesheet.
 *
 * Theme metadata is stored in style.css. Plugin metadata is located by
 * finding a top-level PHP file containing the Plugin Name header.
 *
 * @param {Tree}   tree        Nx virtual filesystem.
 * @param {string} projectRoot Archived project root.
 * @return {string} WordPress metadata file path.
 */
const findWordPressVersionFile = (
    tree: Tree,
    projectRoot: string
): string => {
    const themeStylesheet = joinPathFragments( projectRoot, 'style.css' );

    if (
        containsWordPressHeader(
            tree,
            themeStylesheet,
            THEME_NAME_HEADER_PATTERN
        )
    ) {
        return themeStylesheet;
    }

    const pluginFiles = tree
        .children( projectRoot )
        .filter( ( fileName ) => fileName.endsWith( '.php' ) )
        .sort();

    for ( const fileName of pluginFiles ) {
        const pluginFile = joinPathFragments( projectRoot, fileName );

        if (
            containsWordPressHeader(
                tree,
                pluginFile,
                PLUGIN_NAME_HEADER_PATTERN
            )
        ) {
            return pluginFile;
        }
    }

    throw new Error(
        `WordPress plugin or theme entry point not found in ${ projectRoot }`
    );
};

/**
 * Update a WordPress Version header.
 *
 * Only the first 8 KB are searched, matching WordPress's metadata
 * handling. Existing whitespace and comment formatting are preserved.
 *
 * @param {Tree}   tree       Nx virtual filesystem.
 * @param {string} filePath   WordPress plugin entry point or theme style.css.
 * @param {string} newVersion Calculated release version.
 * @return {void} No return value.
 */
const updateWordPressVersion = (
    tree: Tree,
    filePath: string,
    newVersion: string
): void => {
    const contents = readTextFile( tree, filePath );
    const header = contents.slice( 0, WORDPRESS_HEADER_SIZE );
    const remainder = contents.slice( WORDPRESS_HEADER_SIZE );

    if ( ! VERSION_HEADER_PATTERN.test( header ) ) {
        throw new Error(
            `WordPress Version header not found in ${ filePath }`
        );
    }

    const updatedHeader = header.replace(
        VERSION_HEADER_PATTERN,
        ( _match, prefix: string ) => `${ prefix }${ newVersion }`
    );

    tree.write( filePath, `${ updatedHeader }${ remainder }` );
};

/**
 * Nx Release version actions for WordPress plugins and themes.
 */
export default class WordPressVersionActions extends VersionActions {
    validManifestFilenames: string[] = [];
    /**
     * Registry lookup is unused because release versions come from Git tags.
     *
     * @return {Promise<{ currentVersion: string | null; logText: string } | null>} Always null.
     */
    async readCurrentVersionFromRegistry(): Promise< {
        currentVersion: string | null;
        logText: string;
    } | null > {
        return null;
    }

    /**
     * WordPress plugins and themes are independently versioned.
     *
     * @return {Promise<{ currentVersion: string | null; dependencyCollection: string | null }>} Empty dependency version information.
     */
    async readCurrentVersionOfDependency(): Promise< {
        currentVersion: string | null;
        dependencyCollection: string | null;
    } > {
        return {
            currentVersion: null,
            dependencyCollection: null,
        };
    }

    /**
     * Write the calculated release version to the archived WordPress
     * plugin entry point or theme style.css.
     *
     * @param {Tree}   tree       Nx virtual filesystem.
     * @param {string} newVersion Calculated release version.
     * @return {Promise<string[]>} Nx CLI log messages.
     */
    async updateProjectVersion(
        tree: Tree,
        newVersion: string
    ): Promise< string[] > {
        const projectRoot = this.projectGraphNode.data.root;

        const archivedProjectRoot = joinPathFragments(
            projectRoot,
            '__release-archive__'
        );

        if ( ! tree.exists( archivedProjectRoot ) ) {
            throw new Error(
                `Archived project does not exist: ${ archivedProjectRoot }`
            );
        }

        const versionFile = findWordPressVersionFile(
            tree,
            archivedProjectRoot
        );

        updateWordPressVersion( tree, versionFile, newVersion );

        return [
            `Updated WordPress Version header in ${ versionFile } to ${ newVersion }`,
        ];
    }

    /**
     * Do not rewrite workspace or catalog dependency ranges.
     *
     * @return {Promise<string[]>} No log messages.
     */
    async updateProjectDependencies(): Promise< string[] > {
        return [];
    }

    /**
     * Read the initial version from the WordPress plugin or theme header.
     *
     * This is used as the disk fallback when the project does not yet have
     * a matching release tag.
     *
     * @param {Tree} tree Nx virtual filesystem.
     * @return {Promise<{ currentVersion: string; manifestPath: string } | null>} Current WordPress version and version file path.
     */
    async readCurrentVersionFromSourceManifest( tree: Tree ): Promise< {
        currentVersion: string;
        manifestPath: string;
    } | null > {
        const projectRoot = this.projectGraphNode.data.root;

        const versionFile = findWordPressVersionFile( tree, projectRoot );

        const contents = readTextFile( tree, versionFile );

        const header = contents.slice( 0, WORDPRESS_HEADER_SIZE );

        const match = header.match( VERSION_HEADER_PATTERN );

        if ( ! match?.[ 2 ] ) {
            return null;
        }

        return {
            manifestPath: versionFile,
            currentVersion: match[ 2 ].trim(),
        };
    }
}
