import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree } from '@nx/devkit';
import {
    DEFAULT_WP_ENV_PORT,
    findHighestWpEnvPort,
    getNextWpEnvPorts,
} from './wp-env-ports';

describe( 'wp-env port allocation', () => {
    let tree: Tree;

    beforeEach( () => {
        tree = createTreeWithEmptyWorkspace();
    } );

    it( 'should return the default port pair when no wp-env configs exist', () => {
        expect( findHighestWpEnvPort( tree ) ).toBe( 0 );
        expect( getNextWpEnvPorts( tree ) ).toEqual( {
            port: DEFAULT_WP_ENV_PORT,
            testsPort: DEFAULT_WP_ENV_PORT + 1,
        } );
    } );

    it( 'should use the next port after the highest configured value', () => {
        tree.write(
            'plugins/example/.wp-env.json',
            JSON.stringify( { port: 9004, testsPort: 9005 }, null, 4 )
        );
        tree.write(
            'themes/another/.wp-env.json',
            JSON.stringify( { port: 9006, testsPort: 9007 }, null, 4 )
        );

        expect( findHighestWpEnvPort( tree ) ).toBe( 9007 );
        expect( getNextWpEnvPorts( tree ) ).toEqual( {
            port: 9008,
            testsPort: 9009,
        } );
    } );

    it( 'should advance from testsPort when it is the highest value', () => {
        tree.write(
            'plugins/example/.wp-env.json',
            JSON.stringify( { port: 9004, testsPort: 9005 }, null, 4 )
        );

        expect( getNextWpEnvPorts( tree ) ).toEqual( {
            port: 9006,
            testsPort: 9007,
        } );
    } );
} );
