/**
 * Custom Nx Release version actions for WordPress plugins and themes.
 *
 * Nx Release uses a "version actions" class to read and write version
 * numbers. The default class is built for npm packages. This one is wired
 * from nx.json (release.version.versionActions) and does three things:
 *
 * 1. Read the fallback version from package.json when git tags cannot.
 * 2. Write the new version to package.json (zip name, GitHub Release tag).
 * 3. Write the same version to the WordPress Version header so wp-admin
 *    matches the tag, including alphas.
 *
 * It does not write composer.json. Composer versions come from git tags
 * and packages.json. It also does not rewrite dependency ranges between
 * plugins and themes; each project versions independently.
 */

import { readJson, updateJson, type Tree } from '@nx/devkit';
import { join } from 'node:path';
import { VersionActions } from 'nx/release';
import type { ProjectGraph } from '@nx/devkit';
import type { NxReleaseVersionConfiguration } from 'nx/src/config/nx-json';
import { applyWordpressHeaderVersion } from './wordpress-headers';

/**
 * Nx Release version actions for WordPress plugins and themes.
 * Updates package.json and the WordPress Version header. Does not write composer.json.
 */
export default class WordPressVersionActions extends VersionActions {
    validManifestFilenames = [ 'package.json' ];

    /**
     * Read the current version from package.json when git tags are not used.
     *
     * @param {Tree} tree Virtual filesystem.
     * @return {Promise<{currentVersion: string, manifestPath: string} | null>} Version from disk.
     */
    async readCurrentVersionFromSourceManifest( tree: Tree ): Promise< {
        currentVersion: string;
        manifestPath: string;
    } | null > {
        /*
         * nx.json prefers git tags. This path is the fallback for a first
         * release (--first-release) when no {project}/v* tag exists yet.
         */
        const manifestPath = join(
            this.projectGraphNode.data.root,
            'package.json'
        );
        const packageJson = readJson<{ version?: string }>( tree, manifestPath );
        if ( ! packageJson.version ) {
            return null;
        }
        return {
            manifestPath,
            currentVersion: packageJson.version,
        };
    }

    /**
     * Registry lookup is unused; releases resolve the current version from git tags.
     *
     * @return {Promise<null>} Always null.
     */
    async readCurrentVersionFromRegistry(
        _tree: Tree,
        _currentVersionResolverMetadata: NxReleaseVersionConfiguration[ 'currentVersionResolverMetadata' ]
    ): Promise< { currentVersion: string | null; logText: string } | null > {
        /*
         * We do not publish to npm, so there is no registry version to read.
         * Returning null tells Nx to use git tags or package.json instead.
         */
        return null;
    }

    /**
     * WordPress packages are not versioned against each other in package.json.
     *
     * @return {Promise<{currentVersion: null, dependencyCollection: null}>} Empty dependency version.
     */
    async readCurrentVersionOfDependency(
        _tree: Tree,
        _projectGraph: ProjectGraph,
        _dependencyProjectName: string
    ): Promise< {
        currentVersion: string | null;
        dependencyCollection: string | null;
    } > {
        /*
         * Independent plugins and themes do not bump each other. An empty
         * result stops Nx from rewriting workspace dependency ranges.
         */
        return { currentVersion: null, dependencyCollection: null };
    }

    /**
     * Write the new version to package.json and the WordPress header.
     *
     * @param {Tree}   tree       Virtual filesystem.
     * @param {string} newVersion Semver for this release.
     * @return {Promise<string[]>} Log lines for the CLI.
     */
    async updateProjectVersion(
        tree: Tree,
        newVersion: string
    ): Promise< string[] > {
        const logMessages: string[] = [];
        const projectRoot = this.projectGraphNode.data.root;

        /*
         * package.json "version" is what the zip script and GitHub Release
         * tag use. Nx already decided newVersion (from our Action's
         * specifier). We only write it.
         */
        for ( const manifestToUpdate of this.manifestsToUpdate ) {
            updateJson( tree, manifestToUpdate.manifestPath, ( json ) => {
                json.version = newVersion;
                return json;
            } );
            logMessages.push(
                `New version ${ newVersion } written to ${ manifestToUpdate.manifestPath }`
            );
        }

        const headerLogs = this.updateWordpressHeaders(
            tree,
            projectRoot,
            newVersion
        );
        return [ ...logMessages, ...headerLogs ];
    }

    /**
     * Skip rewriting workspace and catalog dependency ranges in package.json.
     *
     * @return {Promise<string[]>} No log lines.
     */
    async updateProjectDependencies(
        _tree: Tree,
        _projectGraph: ProjectGraph,
        _dependenciesToUpdate: Record< string, string >
    ): Promise< string[] > {
        return [];
    }

    /**
     * Update style.css for themes, or the PHP file that contains Plugin Name for plugins.
     *
     * @param {Tree}   tree        Virtual filesystem.
     * @param {string} projectRoot Project directory.
     * @param {string} newVersion  Semver for this release.
     * @return {string[]} Log lines.
     */
    private updateWordpressHeaders(
        tree: Tree,
        projectRoot: string,
        newVersion: string
    ): string[] {
        /*
         * Themes: style.css in the project root. If that file has Theme Name
         * and Version, stamp it and stop. A plugin should not also have this
         * file as its identity.
         */
        const styleCss = join( projectRoot, 'style.css' );
        if ( tree.exists( styleCss ) ) {
            const contents = tree.read( styleCss, 'utf-8' ) ?? '';
            const next = applyWordpressHeaderVersion( contents, newVersion );
            if ( next !== contents ) {
                tree.write( styleCss, next );
                return [
                    `New version ${ newVersion } written to ${ styleCss }`,
                ];
            }
        }

        /*
         * Plugins: look at every PHP file in the project root for Plugin
         * Name. bcew-blocks is bcgov-wordpress-blocks.php, not
         * bcew-blocks.php, so the filename is not enough.
         */
        const phpFiles = tree
            .children( projectRoot )
            .filter( ( name ) => name.endsWith( '.php' ) );

        for ( const fileName of phpFiles ) {
            const phpPath = join( projectRoot, fileName );
            const contents = tree.read( phpPath, 'utf-8' ) ?? '';
            const next = applyWordpressHeaderVersion( contents, newVersion );
            if ( next !== contents ) {
                tree.write( phpPath, next );
                return [
                    `New version ${ newVersion } written to ${ phpPath }`,
                ];
            }
        }

        return [
            `No WordPress Version header found under ${ projectRoot }`,
        ];
    }
}
