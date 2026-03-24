import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree } from '@nx/devkit';

import { syncWpEnvGenerator } from './sync-wp-env';
import { SyncWpEnvGeneratorSchema } from './schema';

declare const describe: ( name: string, fn: () => void ) => void;
declare const beforeEach: ( fn: () => void ) => void;
declare const it: ( name: string, fn: () => Promise< void > | void ) => void;
declare const expect: ( value: unknown ) => {
    toBe: ( expected: unknown ) => void;
    toEqual: ( expected: unknown ) => void;
};

describe( 'sync wp-env generator', () => {
    let tree: Tree;

    beforeEach( () => {
        // Build an isolated in-memory workspace and seed the shared default versions.
        tree = createTreeWithEmptyWorkspace();
        tree.write(
            'tools/wp-env/config.json',
            JSON.stringify(
                {
                    core: 'WordPress/WordPress#6.8',
                    phpVersion: '7.4',
                },
                null,
                4
            )
        );
    } );

    it( 'should update wp-env files in plugins and themes', async () => {
        // Project-level files should have only core/php updated and keep extra fields intact.
        tree.write(
            'plugins/sample-plugin/.wp-env.json',
            JSON.stringify(
                {
                    core: 'WordPress/WordPress#6.7',
                    phpVersion: '8.0',
                    plugins: [ '.' ],
                },
                null,
                4
            )
        );
        tree.write(
            'themes/sample-theme/.wp-env.json',
            JSON.stringify(
                {
                    core: 'WordPress/WordPress#6.7',
                    phpVersion: '8.0',
                    themes: [ '.' ],
                },
                null,
                4
            )
        );

        const options: SyncWpEnvGeneratorSchema = {
            core: 'WordPress/WordPress#6.8',
            phpVersion: '7.4',
        };

        await syncWpEnvGenerator( tree, options );

        const pluginConfig = JSON.parse(
            tree.read( 'plugins/sample-plugin/.wp-env.json' )!.toString()
        );
        const themeConfig = JSON.parse(
            tree.read( 'themes/sample-theme/.wp-env.json' )!.toString()
        );

        expect( pluginConfig.core ).toBe( 'WordPress/WordPress#6.8' );
        expect( pluginConfig.phpVersion ).toBe( '7.4' );
        expect( pluginConfig.plugins ).toEqual( [ '.' ] );

        expect( themeConfig.core ).toBe( 'WordPress/WordPress#6.8' );
        expect( themeConfig.phpVersion ).toBe( '7.4' );
        expect( themeConfig.themes ).toEqual( [ '.' ] );
    } );

    it( 'should update the root wp-env file by default', async () => {
        // Root config participates unless callers explicitly opt out.
        tree.write(
            '.wp-env.json',
            JSON.stringify(
                {
                    core: 'WordPress/WordPress#6.7',
                    phpVersion: '8.0',
                },
                null,
                4
            )
        );

        const options: SyncWpEnvGeneratorSchema = {
            core: 'WordPress/WordPress#6.8',
            phpVersion: '7.4',
        };

        await syncWpEnvGenerator( tree, options );

        const rootConfig = JSON.parse(
            tree.read( '.wp-env.json' )!.toString()
        );
        expect( rootConfig.core ).toBe( 'WordPress/WordPress#6.8' );
        expect( rootConfig.phpVersion ).toBe( '7.4' );
    } );

    it( 'should skip root wp-env when includeRoot is false', async () => {
        // includeRoot=false should leave root untouched while still syncing project files.
        tree.write(
            '.wp-env.json',
            JSON.stringify(
                {
                    core: 'WordPress/WordPress#6.7',
                    phpVersion: '8.0',
                },
                null,
                4
            )
        );
        tree.write(
            'plugins/sample-plugin/.wp-env.json',
            JSON.stringify(
                {
                    core: 'WordPress/WordPress#6.7',
                    phpVersion: '8.0',
                    plugins: [ '.' ],
                },
                null,
                4
            )
        );

        const options: SyncWpEnvGeneratorSchema = {
            core: 'WordPress/WordPress#6.8',
            phpVersion: '7.4',
            includeRoot: false,
        };

        await syncWpEnvGenerator( tree, options );

        const rootConfig = JSON.parse(
            tree.read( '.wp-env.json' )!.toString()
        );
        const pluginConfig = JSON.parse(
            tree.read( 'plugins/sample-plugin/.wp-env.json' )!.toString()
        );

        expect( rootConfig.core ).toBe( 'WordPress/WordPress#6.7' );
        expect( rootConfig.phpVersion ).toBe( '8.0' );
        expect( pluginConfig.core ).toBe( 'WordPress/WordPress#6.8' );
        expect( pluginConfig.phpVersion ).toBe( '7.4' );
    } );

    it( 'should update generator template wp-env files', async () => {
        // Template files are synced too, so newly generated projects get current versions.
        tree.write(
            'tools/monorepo-plugin/src/generators/plugin/files/.wp-env.json',
            JSON.stringify(
                {
                    core: 'WordPress/WordPress#6.7',
                    phpVersion: '8.0',
                    plugins: [ '.' ],
                },
                null,
                4
            )
        );

        const options: SyncWpEnvGeneratorSchema = {
            core: 'WordPress/WordPress#6.8',
            phpVersion: '7.4',
        };

        await syncWpEnvGenerator( tree, options );

        const templateConfig = JSON.parse(
            tree
                .read(
                    'tools/monorepo-plugin/src/generators/plugin/files/.wp-env.json'
                )!
                .toString()
        );

        expect( templateConfig.core ).toBe( 'WordPress/WordPress#6.8' );
        expect( templateConfig.phpVersion ).toBe( '7.4' );
        expect( templateConfig.plugins ).toEqual( [ '.' ] );
    } );

    it( 'should use tools/wp-env/config.json defaults when options are omitted', async () => {
        // With no options, generator falls back to the shared defaults file.
        tree.write(
            'plugins/sample-plugin/.wp-env.json',
            JSON.stringify(
                {
                    core: 'WordPress/WordPress#6.7',
                    phpVersion: '8.0',
                    plugins: [ '.' ],
                },
                null,
                4
            )
        );

        await syncWpEnvGenerator( tree, {} );

        const pluginConfig = JSON.parse(
            tree.read( 'plugins/sample-plugin/.wp-env.json' )!.toString()
        );

        expect( pluginConfig.core ).toBe( 'WordPress/WordPress#6.8' );
        expect( pluginConfig.phpVersion ).toBe( '7.4' );
    } );
} );
