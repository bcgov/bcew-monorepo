const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );
const {
    BLOCK_NAME,
    addSavedForm,
    clearSavedForms,
    ensureBlockSettingsVisible,
    mockChefsFormRoutes,
    selectFormAndPublish,
    selectSavedFormId,
    setup,
} = require( './chefs-form-helpers' );

test.describe( 'CHEFS Form editor', () => {
    test( 'can be inserted from the block editor with a formId attribute', async ( {
        admin,
        editor,
    } ) => {
        await admin.createNewPost();
        await editor.insertBlock( { name: BLOCK_NAME } );
        await expect(
            editor.canvas.locator( `[data-type="${ BLOCK_NAME }"]` )
        ).toBeVisible();
        const blocks = await editor.getBlocks();
        const chefsBlock = blocks.find(
            ( block ) => block.name === BLOCK_NAME
        );
        expect( chefsBlock ).toBeDefined();
        expect( chefsBlock.attributes.formId ).toBeDefined();
    } );

    test( 'loads saved Form IDs into the sidebar dropdown and preview', async ( {
        admin,
        editor,
        page,
    } ) => {
        const formIdOne = '11111111-1111-4111-8111-111111111111';
        const formIdTwo = '22222222-2222-4222-8222-222222222222';
        const mockBaseUrl = 'https://chefs-preview.test/app';
        await addSavedForm( admin, page, formIdOne, 'api-key-one' );
        await addSavedForm( admin, page, formIdTwo, 'api-key-two' );
        await mockChefsFormRoutes( page, {
            token: 'preview-token',
            baseUrl: mockBaseUrl,
        } );
        await admin.createNewPost();
        await editor.insertBlock( { name: BLOCK_NAME } );
        await ensureBlockSettingsVisible( editor, page );
        const formSelect = page.getByLabel( 'Form ID' ).first();
        await expect( formSelect ).toBeVisible();
        const optionValues = await formSelect
            .locator( 'option' )
            .evaluateAll( ( options ) =>
                options.map( ( option ) => option.value )
            );
        expect( optionValues ).toEqual(
            expect.arrayContaining( [ '', formIdOne, formIdTwo ] )
        );
        await selectSavedFormId( page, formIdOne );
        const viewer = editor.canvas.locator( 'chefs-form-viewer' );
        await expect( viewer ).toBeAttached();
        await expect( viewer ).toHaveAttribute( 'form-id', formIdOne );
        await expect( viewer ).toHaveAttribute( 'auth-token', 'preview-token' );
        await expect( viewer ).toHaveAttribute( 'base-url', mockBaseUrl );
        await expect( viewer ).toHaveAttribute( 'read-only', '' );
    } );

    test( 'persists and clears a selected Form ID when the saved form is removed', async ( {
        admin,
        editor,
        page,
    } ) => {
        const formId = '33333333-3333-4333-8333-333333333333';
        await addSavedForm( admin, page, formId, 'persisted-api-key' );
        await mockChefsFormRoutes( page, {
            token: 'persisted-preview-token',
            baseUrl: 'https://chefs-preview.test/app',
        } );
        const postId = await selectFormAndPublish(
            admin,
            editor,
            page,
            formId
        );
        await page.goto( `/wp-admin/post.php?post=${ postId }&action=edit` );
        await expect(
            editor.canvas.locator( `[data-type="${ BLOCK_NAME }"]` ).first()
        ).toBeVisible();
        await ensureBlockSettingsVisible( editor, page );
        await expect( page.getByLabel( 'Form ID' ).first() ).toHaveValue(
            formId
        );
        await clearSavedForms( admin, page );
        await page.goto( `/wp-admin/post.php?post=${ postId }&action=edit` );
        await expect(
            editor.canvas.locator( `[data-type="${ BLOCK_NAME }"]` ).first()
        ).toBeVisible();
        await expect(
            editor.canvas.getByText(
                'Select a CHEFS form in the block settings.'
            )
        ).toBeVisible();
        const blocks = await editor.getBlocks();
        const chefsBlock = blocks.find(
            ( block ) => block.name === BLOCK_NAME
        );
        expect( chefsBlock.attributes.formId ).toBe( '' );
    } );

    test( 'shows empty-state settings link and placeholder when no form is selected', async ( {
        admin,
        editor,
        page,
    } ) => {
        await setup( { admin, page } );
        await admin.createNewPost();
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
        const settingsLink = chefsPanel.getByRole( 'link', {
            name: 'Open CHEFS settings',
        } );
        await expect( settingsLink ).toBeVisible();
        await expect( settingsLink ).toHaveAttribute(
            'href',
            /admin\.php\?page=bcew-chefs-embed-settings/
        );
    } );

    test( 'shows an error when embed-config cannot load the form', async ( {
        admin,
        editor,
        page,
    } ) => {
        const formId = '66666666-6666-4666-8666-666666666666';
        await addSavedForm( admin, page, formId, 'preview-error-api-key' );
        await page.route( /embed-config/, async ( route ) => {
            await route.fulfill( {
                status: 404,
                contentType: 'application/json',
                body: JSON.stringify( {
                    code: 'chefs_form_not_configured',
                    message:
                        'Unable to decrypt the configured CHEFS credentials.',
                } ),
            } );
        } );
        await admin.createNewPost();
        await editor.insertBlock( { name: BLOCK_NAME } );
        await ensureBlockSettingsVisible( editor, page );
        await selectSavedFormId( page, formId );
        await expect(
            editor.canvas.getByText(
                'Unable to decrypt the configured CHEFS credentials.'
            )
        ).toBeVisible();
    } );
} );
