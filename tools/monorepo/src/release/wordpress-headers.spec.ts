import { applyWordpressHeaderVersion } from './wordpress-headers';

describe( 'applyWordpressHeaderVersion', () => {
    it( 'updates a theme style.css Version header, including prereleases', () => {
        const input = `/*
Theme Name: BC Extended Web Theme
Version: 1.16.0
License: Apache License Version 2.0
*/
`;
        const output = applyWordpressHeaderVersion( input, '1.17.0-alpha.1' );
        expect( output ).toContain( 'Version:      1.17.0-alpha.1' );
        expect( output ).not.toContain( 'Version: 1.16.0' );
    } );

    it( 'updates a plugin bootstrap Version header when the file is not named after the project', () => {
        const input = `<?php
/**
 * Plugin Name:       BCEW Blocks
 * Version:           1.0.0
 * Requires at least: 6.7
 */
`;
        const output = applyWordpressHeaderVersion( input, '1.2.3-alpha.1' );
        expect( output ).toContain( '* Version:           1.2.3-alpha.1' );
        expect( output ).toContain( 'Plugin Name:       BCEW Blocks' );
    } );

    it( 'leaves composer-style json unchanged', () => {
        const input = `{
    "name": "bcgov-plugin/bcew-plugin",
    "description": "BC Extended Web Plugin"
}
`;
        expect( applyWordpressHeaderVersion( input, '9.9.9' ) ).toBe( input );
    } );
} );
