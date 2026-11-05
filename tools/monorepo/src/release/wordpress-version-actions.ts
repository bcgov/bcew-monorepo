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

import { readJson, type Tree } from '@nx/devkit';
import { join } from 'node:path';
// nx is installed at the workspace root. This file is the Nx release version action.
// eslint-disable-next-line import/no-extraneous-dependencies
import { VersionActions } from 'nx/release';

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
        const packageJson = readJson< { version?: string } >(
            tree,
            manifestPath
        );
        if ( ! packageJson.version ) {
            return null;
        }
        return {
            manifestPath,
            currentVersion: packageJson.version,
        };
    }

    /**
     * This override is required, so the package.json version is not updated by Nx Release.
     *
     * @return {Promise<string[]>} Log lines for the CLI.
     */
    async updateProjectVersion(): Promise< string[] > {
        const logMessages: string[] = [];
        return logMessages;
    }

    /**
     * Skip rewriting workspace and catalog dependency ranges in package.json.
     *
     * @return {Promise<string[]>} No log lines.
     */
    async updateProjectDependencies(): Promise< string[] > {
        return [];
    }
}
