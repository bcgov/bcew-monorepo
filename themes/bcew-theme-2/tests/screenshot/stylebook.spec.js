import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'style book', () => {
    test( 'all blocks', async ( { admin } ) => {
        // These blocks don't display in WP's style-book.
        const EXCLUDED_BLOCKS = [
            'avatar',
            'column',
            'comments',
            'comment-template',
            'embed',
            'footnotes',
            'list-item',
            'next-page',
            'pagination',
            'post-template',
            'query-total',
            'spacer',
            'rss',
            'tag-cloud',
            'video',
            'calendar',
            'latest-comments',
            'archives',
        ];

        await admin.visitAdminPage(
            'site-editor.php',
            'path=%2Fwp_global_styles'
        );

        // Wait for the page to load and the style book button to be available, unfortunately.
        await new Promise( ( r ) => setTimeout( r, 2000 ) );

        await admin.page.getByRole( 'button', { name: 'Style Book' } ).click();

        const canvas = admin.page.frameLocator(
            'iframe[name="style-book-canvas"]'
        );
        await expect( canvas.locator( 'body' ) ).toBeVisible();

        const blocks = await canvas.locator(
            'div.edit-site-style-book__example'
        );

        const blockCount = await blocks.count();

        await expect( blockCount ).toBeGreaterThan( 0 );

        for ( let i = 0; i < blockCount; i++ ) {
            const block = blocks.nth( i );
            const blockName = await block.getAttribute( 'id' );
            const formattedName = blockName.replace( 'example-core/', '' );

            if ( EXCLUDED_BLOCKS.includes( formattedName ) ) {
                continue;
            }

            await block
                .locator( 'div.edit-site-style-book__example-preview' )
                .screenshot( {
                    path:
                        'tests/screenshot/__snapshots__/style-book-' +
                        formattedName +
                        '.png',
                } );
        }
    } );
} );
