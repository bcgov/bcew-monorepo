import { Tree, readJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { setupWpEnvSync } from './setup-wp-env-sync';

describe( 'setup-wp-env-sync generator', () => {
    let tree: Tree;

    beforeEach( () => {
        tree = createTreeWithEmptyWorkspace();
        tree.write( 'package.json', JSON.stringify( { scripts: {} } ) );
        tree.write(
            'nx.json',
            JSON.stringify( {
                targetDefaults: {
                    'wp-env-start': {
                        executor: 'nx:run-commands',
                        options: { command: 'wp-env start' },
                    },
                },
            } )
        );
    } );

    it( 'should create config.json and cli.js', async () => {
        await setupWpEnvSync( tree, {} );
        expect( tree.exists( 'tools/wp-env/config.json' ) ).toBe( true );
        expect( tree.exists( 'tools/wp-env/cli.js' ) ).toBe( true );
    } );

    it( 'should update package.json with wp-env:sync script', async () => {
        await setupWpEnvSync( tree, {} );
        const packageJson = readJson( tree, 'package.json' );
        expect( packageJson.scripts[ 'wp-env:sync' ] ).toBe(
            'node tools/wp-env/cli.js'
        );
    } );

    it( 'should add wp-env-sync target to nx.json', async () => {
        await setupWpEnvSync( tree, {} );
        const nxJson = readJson( tree, 'nx.json' );
        expect( nxJson.targetDefaults[ 'wp-env-sync' ] ).toBeDefined();
        expect( nxJson.targetDefaults[ 'wp-env-sync' ].executor ).toBe(
            'nx:run-commands'
        );
    } );

    it( 'should not modify wp-env-start dependencies', async () => {
        await setupWpEnvSync( tree, {} );
        const nxJson = readJson( tree, 'nx.json' );
        expect(
            nxJson.targetDefaults[ 'wp-env-start' ].dependsOn
        ).toBeUndefined();
    } );

    it( 'should use custom WordPress and PHP versions if provided', async () => {
        await setupWpEnvSync( tree, {
            wordPressVersion: 'WordPress/WordPress#7.0',
            phpVersion: '8.3',
        } );
        const config = readJson( tree, 'tools/wp-env/config.json' );
        expect( config.core ).toBe( 'WordPress/WordPress#7.0' );
        expect( config.phpVersion ).toBe( '8.3' );
    } );
} );
