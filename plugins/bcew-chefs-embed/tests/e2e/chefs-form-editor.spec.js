const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );
const {
    BLOCK_NAME,
    assertBlockVisible,
    ensureBlockSettingsVisible,
    getChefsBlock,
} = require( './chefs-form-helpers' );

test.describe( 'CHEFS Form editor', () => {
    test( 'can be inserted from the block editor with a formId attribute', async ( {
        admin,
        editor,
        page,
    } ) => {
        await admin.createNewPost();
        await expect( page ).toHaveURL( /\/wp-admin\/post-new\.php/ );
        await expect(
            page.locator( '.block-editor__container' )
        ).toBeVisible();
        await editor.insertBlock( { name: BLOCK_NAME } );
        await assertBlockVisible( editor );
        const chefsBlock = await getChefsBlock( editor );
        expect( chefsBlock ).toBeDefined();
        expect( chefsBlock.attributes.formId ).toBeDefined();
    } );

    test( 'shows empty-state message and placeholder when no form is selected', async ( {
        admin,
        editor,
        page,
    } ) => {
        await admin.createNewPost();
        await expect( page ).toHaveURL( /\/wp-admin\/post-new\.php/ );
        await expect(
            page.locator( '.block-editor__container' )
        ).toBeVisible();
        await editor.insertBlock( { name: BLOCK_NAME } );
        await expect(
            editor.canvas.getByText(
                'Select a CHEFS form in the block settings.'
            )
        ).toBeVisible();
        await ensureBlockSettingsVisible( editor, page );
        const chefsPanel = page
            .locator( '.components-panel__body' )
            .filter( { hasText: 'CHEFS Form' } )
            .first();
        await expect(
            chefsPanel.getByText( /No CHEFS forms have been saved yet\./i )
        ).toBeVisible();
    } );
} );
