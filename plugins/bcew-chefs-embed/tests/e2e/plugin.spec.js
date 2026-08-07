const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test( 'CHEFS Embed plugin is active', async ( { requestUtils } ) => {
    const plugins = await requestUtils.rest( {
        path: '/wp/v2/plugins',
    } );

    const plugin = plugins.find(
        ( p ) => 'bcew-chefs-embed/bcew-chefs-embed' === p.plugin
    );

    expect( plugin ).toBeDefined();
    expect( plugin.status ).toBe( 'active' );
} );
