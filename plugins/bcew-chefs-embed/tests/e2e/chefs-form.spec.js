const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

const BLOCK_NAME = 'bcew-chefs-embed/chefs-form';
const PLUGIN_BASENAME = 'bcew-chefs-embed/bcew-chefs-embed';
const SETTINGS_PAGE_QUERY = 'page=bcew-chefs-embed-settings';
const ensurePluginIsActive = async ( requestUtils ) => {
    const plugins = await requestUtils.rest( {
        path: '/wp/v2/plugins',
    } );

    const plugin = plugins.find( ( candidatePlugin ) => {
        return PLUGIN_BASENAME === candidatePlugin.plugin;
    } );

    expect( plugin ).toBeDefined();

    if ( 'active' === plugin.status ) {
        return;
    }

    await requestUtils.rest( {
        method: 'PUT',
        path: `/wp/v2/plugins/${ encodeURIComponent( PLUGIN_BASENAME ) }`,
        data: {
            status: 'active',
        },
    } );
};

const clearSavedForms = async ( admin, page ) => {
    await admin.visitAdminPage( 'admin.php', SETTINGS_PAGE_QUERY );

    await expect( page ).toHaveURL(
        /\/wp-admin\/admin\.php\?page=bcew-chefs-embed-settings/
    );

    const settingsHeading = page.getByRole( 'heading', {
        name: 'CHEFS Settings',
    } );
    const unauthorizedMessage = page.getByText(
        /You do not have sufficient permissions|Unauthorized|Forbidden/i
    );

    if ( 0 === ( await settingsHeading.count() ) ) {
        await expect( unauthorizedMessage ).toHaveCount( 0 );
        return;
    }

    await expect( settingsHeading ).toBeVisible();

    const removeButton = page.getByRole( 'button', { name: 'Remove' } );

    while ( ( await removeButton.count() ) > 0 ) {
        await removeButton.first().click();
        await page.waitForLoadState( 'networkidle' );
    }
};

const addSavedForm = async ( admin, page, formId, apiKey ) => {
    await admin.visitAdminPage( 'admin.php', SETTINGS_PAGE_QUERY );

    await expect( page ).toHaveURL(
        /\/wp-admin\/admin\.php\?page=bcew-chefs-embed-settings/
    );

    const settingsHeading = page.getByRole( 'heading', {
        name: 'CHEFS Settings',
    } );

    const unauthorizedMessage = page.getByText(
        /You do not have sufficient permissions|Unauthorized|Forbidden/i
    );

    if ( ( await unauthorizedMessage.count() ) > 0 ) {
        throw new Error(
            'CHEFS settings page is not accessible (permission denied). ' +
                'Verify the test user can manage options and access admin pages.'
        );
    }

    await expect( settingsHeading ).toBeVisible( { timeout: 15000 } );

    const formIdField = page.getByLabel( 'Form ID' ).first();
    const apiKeyField = page.getByLabel( 'API Key' ).first();

    await expect( formIdField ).toBeVisible();
    await expect( apiKeyField ).toBeVisible();

    await formIdField.fill( formId );
    await apiKeyField.fill( apiKey );
    await page.getByRole( 'button', { name: 'Save' } ).click();

    await expect( page.locator( '.notice-success' ) ).toContainText( 'Saved.' );
};

const ensureBlockSettingsVisible = async ( editor, page ) => {
    const block = editor.canvas
        .locator( `[data-type="${ BLOCK_NAME }"]` )
        .first();

    await expect( block ).toBeVisible();
    await block.click();

    const settingsButton = page
        .getByRole( 'button', { name: 'Settings' } )
        .first();

    if (
        'false' === ( await settingsButton.getAttribute( 'aria-expanded' ) )
    ) {
        await settingsButton.click();
    }

    const chefsPanelButton = page
        .getByRole( 'button', { name: 'CHEFS Form' } )
        .first();

    if ( ( await chefsPanelButton.count() ) > 0 ) {
        if (
            'false' ===
            ( await chefsPanelButton.getAttribute( 'aria-expanded' ) )
        ) {
            await chefsPanelButton.click();
        }
    }
};

test.describe( 'CHEFS Form block', () => {
    test.beforeEach( async ( { admin, page, requestUtils } ) => {
        await ensurePluginIsActive( requestUtils );
        await clearSavedForms( admin, page );
    } );

    test( 'can be inserted from the block editor', async ( {
        admin,
        editor,
    } ) => {
        await admin.createNewPost();

        await editor.insertBlock( {
            name: BLOCK_NAME,
        } );

        const block = editor.canvas.locator( `[data-type="${ BLOCK_NAME }"]` );

        await expect( block ).toBeVisible();
    } );

    test( 'has a formId attribute', async ( { admin, editor } ) => {
        await admin.createNewPost();

        await editor.insertBlock( {
            name: BLOCK_NAME,
        } );

        const blocks = await editor.getBlocks();

        const chefsBlock = blocks.find(
            ( block ) => block.name === BLOCK_NAME
        );

        expect( chefsBlock ).toBeDefined();
        expect( chefsBlock.attributes.formId ).toBeDefined();
    } );

    test( 'loads saved Form IDs into the sidebar dropdown', async ( {
        admin,
        editor,
        page,
    } ) => {
        const formIdOne = '11111111-1111-4111-8111-111111111111';
        const formIdTwo = '22222222-2222-4222-8222-222222222222';

        await addSavedForm( admin, page, formIdOne, 'api-key-one' );
        await addSavedForm( admin, page, formIdTwo, 'api-key-two' );

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
    } );

    test( 'persists selected Form ID after publish and reopen', async ( {
        admin,
        editor,
        page,
    } ) => {
        const formId = '33333333-3333-4333-8333-333333333333';

        await addSavedForm( admin, page, formId, 'persisted-api-key' );

        await admin.createNewPost();
        await editor.insertBlock( { name: BLOCK_NAME } );
        await ensureBlockSettingsVisible( editor, page );

        const formSelect = page.getByLabel( 'Form ID' ).first();
        await formSelect.selectOption( formId );
        await expect( formSelect ).toHaveValue( formId );

        const postId = await editor.publishPost();
        expect( postId ).not.toBeNull();

        await page.goto( `/wp-admin/post.php?post=${ postId }&action=edit` );
        await expect(
            editor.canvas.locator( `[data-type="${ BLOCK_NAME }"]` ).first()
        ).toBeVisible();

        await ensureBlockSettingsVisible( editor, page );
        await expect( page.getByLabel( 'Form ID' ).first() ).toHaveValue(
            formId
        );
    } );

    test( 'clears a selected Form ID after its saved form is removed', async ( {
        admin,
        editor,
        page,
    } ) => {
        const formId = '44444444-4444-4444-8444-444444444444';

        await addSavedForm( admin, page, formId, 'removed-api-key' );

        await admin.createNewPost();
        await editor.insertBlock( { name: BLOCK_NAME } );
        await ensureBlockSettingsVisible( editor, page );

        const formSelect = page.getByLabel( 'Form ID' ).first();
        await formSelect.selectOption( formId );
        await expect( formSelect ).toHaveValue( formId );

        const postId = await editor.publishPost();
        expect( postId ).not.toBeNull();

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

    test( 'shows settings link when no saved forms exist', async ( {
        admin,
        editor,
        page,
    } ) => {
        await admin.createNewPost();
        await editor.insertBlock( { name: BLOCK_NAME } );
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

    test( 'shows placeholder when no form is selected', async ( {
        admin,
        editor,
    } ) => {
        await admin.createNewPost();
        await editor.insertBlock( { name: BLOCK_NAME } );

        const placeholder = editor.canvas.getByText(
            'Select a CHEFS form in block settings.'
        );

        await expect( placeholder ).toBeVisible();
    } );

    test( 'loads read-only CHEFS preview via embed-config when a form is selected', async ( {
        admin,
        editor,
        page,
    } ) => {
        const formId = '55555555-5555-4555-8555-555555555555';
        const mockBaseUrl = 'https://chefs-preview.test/app';

        await addSavedForm( admin, page, formId, 'preview-test-api-key' );

        await page.route(
            '**/wp-json/bcew-chefs-embed/v1/embed-config**',
            async ( route ) => {
                await route.fulfill( {
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify( {
                        token: 'preview-token',
                        baseUrl: mockBaseUrl,
                    } ),
                } );
            }
        );

        await page.route(
            `${ mockBaseUrl }/embed/chefs-form-viewer.min.js`,
            async ( route ) => {
                await route.fulfill( {
                    status: 200,
                    contentType: 'application/javascript',
                    body: `
						class ChefsFormViewerStub extends HTMLElement {
							load() {
								return Promise.resolve();
							}
						}
						if ( ! customElements.get( 'chefs-form-viewer' ) ) {
							customElements.define( 'chefs-form-viewer', ChefsFormViewerStub );
						}
					`,
                } );
            }
        );

        await admin.createNewPost();
        await editor.insertBlock( { name: BLOCK_NAME } );
        await ensureBlockSettingsVisible( editor, page );

        const formSelect = page.getByLabel( 'Form ID' ).first();
        await formSelect.selectOption( formId );

        const viewer = editor.canvas.locator( 'chefs-form-viewer' );

        await expect( viewer ).toBeVisible();
        await expect( viewer ).toHaveAttribute( 'form-id', formId );
        await expect( viewer ).toHaveAttribute( 'auth-token', 'preview-token' );
        await expect( viewer ).toHaveAttribute( 'base-url', mockBaseUrl );
        await expect( viewer ).toHaveAttribute( 'read-only', '' );
    } );

    test( 'shows an error when embed-config cannot load the form', async ( {
        admin,
        editor,
        page,
    } ) => {
        const formId = '66666666-6666-4666-8666-666666666666';

        await addSavedForm( admin, page, formId, 'preview-error-api-key' );

        await page.route(
            '**/wp-json/bcew-chefs-embed/v1/embed-config**',
            async ( route ) => {
                await route.fulfill( {
                    status: 404,
                    contentType: 'application/json',
                    body: JSON.stringify( {
                        code: 'chefs_form_not_configured',
                        message:
                            'Unable to decrypt the configured CHEFS credentials.',
                    } ),
                } );
            }
        );

        await admin.createNewPost();
        await editor.insertBlock( { name: BLOCK_NAME } );
        await ensureBlockSettingsVisible( editor, page );

        const formSelect = page.getByLabel( 'Form ID' ).first();
        await formSelect.selectOption( formId );

        await expect(
            editor.canvas.getByText(
                'Unable to decrypt the configured CHEFS credentials.'
            )
        ).toBeVisible();
    } );
} );
