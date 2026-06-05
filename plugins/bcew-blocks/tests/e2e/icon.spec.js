const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.describe( 'Icon block', () => {
    const BLOCK_NAME = 'bcew-blocks/icon';
    const BLOCK_CLASS = '.wp-block-bcew-blocks-icon';

    test( 'complete icon block workflow - editor to published page', async ( {
        admin,
        editor,
        page,
    } ) => {
        await admin.createNewPost();
        await editor.insertBlock( { name: BLOCK_NAME } );

        const block = editor.canvas
            .locator( `[data-type="${ BLOCK_NAME }"]` )
            .first();
        await expect( block ).toBeVisible();
        await block.click();

        const inspectorPanel = page
            .locator( '.components-panel__body' )
            .filter( { hasText: 'Pick an icon' } )
            .first();
        await expect( inspectorPanel ).toBeVisible();

        // No icon yet: editor preview shows the empty-state call to action.
        await expect(
            editor.canvas.locator(
                `${ BLOCK_CLASS } .bcgov-wp-blocks-icon__preview`
            )
        ).toContainText( 'Select icon' );

        // Filter the picker and choose an icon like a user would.
        await page.getByPlaceholder( 'Search icons' ).fill( 'house' );
        await expect( inspectorPanel ).toContainText( 'Showing 1 of' );
        await page.getByRole( 'button', { name: 'House' } ).click();

        const canvasIcon = editor.canvas
            .locator( `${ BLOCK_CLASS } i.bcgov-wp-blocks-icon__preview` )
            .first();
        await expect( canvasIcon ).toBeVisible();
        await expect( canvasIcon ).toHaveClass( /fa-house/ );

        // Resize in the sidebar and confirm the canvas wrapper picks up size classes.
        await page.getByLabel( 'Icon size' ).selectOption( 'small' );
        await expect( block ).toHaveClass( /bcgov-wp-blocks-icon--size-small/ );

        await page.getByLabel( 'Icon size' ).selectOption( 'large' );
        await expect( block ).toHaveClass( /bcgov-wp-blocks-icon--size-large/ );

        // Meaningful icon: custom accessible name is reflected for assistive tech.
        await page.getByLabel( 'Accessible name' ).fill( 'Main entrance' );

        // Decorative mode hides the custom name field from the UI.
        await page.getByLabel( 'Decorative' ).click();
        await expect( page.getByLabel( 'Accessible name' ) ).toHaveCount( 0 );

        await page.getByLabel( 'Decorative' ).click();
        await expect( page.getByLabel( 'Accessible name' ) ).toBeVisible();
        await expect( page.getByLabel( 'Accessible name' ) ).toHaveValue(
            'Main entrance'
        );

        // Publish with a meaningful, labelled icon at large size.
        const postId = await editor.publishPost();
        expect( postId ).not.toBeNull();

        await page.goto( `/?p=${ postId }` );

        const frontendBlock = page.locator( BLOCK_CLASS ).first();
        await expect( frontendBlock ).toBeVisible();
        await expect( frontendBlock ).toHaveClass(
            /bcgov-wp-blocks-icon--size-large/
        );
        await expect( frontendBlock ).toHaveAttribute( 'role', 'img' );
        await expect( frontendBlock ).toHaveAttribute(
            'aria-label',
            'Main entrance'
        );

        const frontendGlyph = frontendBlock.locator( 'i' ).first();
        await expect( frontendGlyph ).toBeVisible();
        await expect( frontendGlyph ).toHaveClass( /fa-house/ );
        await expect( frontendGlyph ).toHaveAttribute( 'aria-hidden', 'true' );
    } );
} );
