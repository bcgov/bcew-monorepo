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

test( 'CHEFS settings menu is removed and the Documentation link remains', async ( {
    admin,
    page,
} ) => {
    await admin.visitAdminPage( 'plugins.php' );

    await expect(
        page.locator( '#toplevel_page_bcew-chefs-embed-settings' )
    ).toHaveCount( 0 );

    const pluginRow = page.locator(
        'tr[data-plugin="bcew-chefs-embed/bcew-chefs-embed.php"]'
    );
    const documentationLink = pluginRow.getByRole( 'link', {
        name: 'Documentation',
    } );
    await expect( documentationLink ).toHaveAttribute(
        'href',
        'https://bcgov.github.io/bcew-monorepo/docs/content/plugins/bcew-chefs-embed/'
    );
    await expect(
        pluginRow.getByRole( 'link', { name: 'Settings' } )
    ).toHaveCount( 0 );
} );
