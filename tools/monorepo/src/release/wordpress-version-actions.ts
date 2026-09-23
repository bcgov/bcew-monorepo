/**
 * Custom Nx Release version actions for WordPress plugins and themes.
 *
 * Nx Release uses a "version actions" class to read and write version
 * numbers. The default class is built for npm packages. This one is wired
 * from nx.json (release.version.versionActions) and does two things:
 *
 * 1. Read the fallback version from package.json when git tags cannot.
 * 2. Write the new version to package.json (zip name, GitHub Release tag).
 *
 * It does not edit plugin or theme source. The WordPress Version header
 * stays as it is in git. The release zip stamps that header in a temp copy.
 * It does not write composer.json. Composer versions come from git tags
 * and packages.json. It also does not rewrite dependency ranges between
 * plugins and themes; each project versions independently.
 */

import { readJson, updateJson, type Tree } from '@nx/devkit';
import { join } from 'node:path';
import { VersionActions } from 'nx/release';
import type { ProjectGraph } from '@nx/devkit';
import type { NxReleaseVersionConfiguration } from 'nx/src/config/nx-json';

/**
 * Nx Release version actions for WordPress plugins and themes.
 * Updates package.json only. Does not write plugin or theme source, or composer.json.
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
     * Write the new version to package.json.
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

        /*
         * package.json "version" is what the zip script and GitHub Release
         * tag use. Nx already decided newVersion (from our Action's
         * specifier). We only write it. Plugin PHP and theme style.css
         * stay untouched.
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

        return logMessages;
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
}
