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

    const removeButton = page.getByRole( 'button', {
        name: 'Remove form',
        exact: true,
    } );

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
    await page.getByRole( 'button', { name: 'Save', exact: true } ).click();

    await expect( page.locator( '.notice-success' ) ).toContainText( 'Saved.' );
};

/**
 * Drop auth cookies so the next navigation is an anonymous visitor.
 * (@wordpress/e2e-test-utils-playwright@1.50 has no requestUtils.logout.)
 *
 * @param {import('@playwright/test').Page} page Playwright page.
 */
const becomeAnonymousVisitor = async ( page ) => {
    await page.context().clearCookies();
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
            'Select a CHEFS form in the block settings.'
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
							connectedCallback() {
								this.style.display = 'block';
								this.style.minHeight = '40px';
							}
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

        // Stub custom elements start with no layout box; assert attach + attrs.
        await expect( viewer ).toBeAttached();
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

    test( 'published page markup includes Form ID only and loads the CHEFS viewer', async ( {
        admin,
        editor,
        page,
    } ) => {
        const formId = '77777777-7777-4777-8777-777777777777';
        const mockBaseUrl = 'https://chefs-frontend.test/app';
        const mockToken = 'frontend-token-secret';

        await addSavedForm( admin, page, formId, 'frontend-test-api-key' );

        await page.route(
            '**/wp-json/bcew-chefs-embed/v1/embed-config**',
            async ( route ) => {
                await route.fulfill( {
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify( {
                        token: mockToken,
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
							connectedCallback() {
								this.style.display = 'block';
								this.style.minHeight = '40px';
							}
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
        await page.getByLabel( 'Form ID' ).first().selectOption( formId );

        const postId = await editor.publishPost();
        expect( postId ).not.toBeNull();

        await becomeAnonymousVisitor( page );

        const response = await page.goto( `/?p=${ postId }` );
        expect( response ).not.toBeNull();
        const serverHtml = await response.text();

        expect( serverHtml ).toContain( `data-form-id="${ formId }"` );
        expect( serverHtml ).not.toContain( 'frontend-test-api-key' );
        expect( serverHtml ).not.toContain( mockToken );
        expect( serverHtml ).not.toContain( 'auth-token' );
        expect( serverHtml ).not.toContain( 'api-key' );

        const block = page.locator( '.bcew-chefs-form' ).first();
        await expect( block ).toHaveAttribute( 'data-form-id', formId );

        const viewer = page.locator( 'chefs-form-viewer' );
        await expect( viewer ).toBeAttached();
        await expect( viewer ).toHaveAttribute( 'form-id', formId );
        await expect( viewer ).toHaveAttribute( 'auth-token', mockToken );
        await expect( viewer ).toHaveAttribute( 'base-url', mockBaseUrl );
        await expect( viewer ).not.toHaveAttribute( 'read-only' );
        await expect( viewer ).toHaveAttribute(
            'auto-reload-on-submit',
            'false'
        );
    } );

    test( 'published page shows generic success message after submit', async ( {
        admin,
        editor,
        page,
    } ) => {
        const formId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
        const mockBaseUrl = 'https://chefs-frontend.test/app';
        const mockToken = 'frontend-success-token';

        await addSavedForm( admin, page, formId, 'frontend-success-api-key' );

        await page.route(
            '**/wp-json/bcew-chefs-embed/v1/embed-config**',
            async ( route ) => {
                await route.fulfill( {
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify( {
                        token: mockToken,
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
                    body: [
                        'class ChefsFormViewerStub extends HTMLElement {',
                        '  connectedCallback() {',
                        "    this.style.display = 'block';",
                        "    this.style.minHeight = '40px';",
                        '  }',
                        '  load() { return Promise.resolve(); }',
                        '}',
                        "if ( ! customElements.get( 'chefs-form-viewer' ) ) {",
                        "  customElements.define( 'chefs-form-viewer', ChefsFormViewerStub );",
                        '}',
                    ].join( '\n' ),
                } );
            }
        );

        await admin.createNewPost();
        await editor.insertBlock( { name: BLOCK_NAME } );
        await ensureBlockSettingsVisible( editor, page );
        await page.getByLabel( 'Form ID' ).first().selectOption( formId );

        const postId = await editor.publishPost();
        expect( postId ).not.toBeNull();

        await becomeAnonymousVisitor( page );

        const response = await page.goto( `/?p=${ postId }` );
        expect( response ).not.toBeNull();

        const viewer = page.locator( 'chefs-form-viewer' );
        await expect( viewer ).toBeAttached();
        await expect( viewer ).toHaveAttribute(
            'auto-reload-on-submit',
            'false'
        );

        await viewer.evaluate( ( el ) => {
            el.dispatchEvent(
                new CustomEvent( 'formio:submitDone', {
                    bubbles: true,
                    composed: true,
                    detail: { submission: {} },
                } )
            );
        } );

        const success = page.locator( '.bcew-chefs-form__success' );
        await expect( success ).toBeVisible();
        await expect( success ).toHaveAttribute( 'role', 'status' );
        await expect( success.getByRole( 'heading', { level: 2 } ) ).toHaveText(
            'Success'
        );
        await expect(
            success.getByText( 'Your form has been submitted successfully' )
        ).toBeVisible();
        await expect( page.locator( 'chefs-form-viewer' ) ).toHaveCount( 0 );
    } );

    test( 'published page shows CHEFS error above the form', async ( {
        admin,
        editor,
        page,
    } ) => {
        const formId = 'cccccccc-dddd-4eee-8fff-111111111111';
        const mockBaseUrl = 'https://chefs-frontend.test/app';
        const mockToken = 'frontend-error-handler-token';

        await addSavedForm( admin, page, formId, 'frontend-error-handler-key' );

        await page.route(
            '**/wp-json/bcew-chefs-embed/v1/embed-config**',
            async ( route ) => {
                await route.fulfill( {
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify( {
                        token: mockToken,
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
                    body: [
                        'class ChefsFormViewerStub extends HTMLElement {',
                        '  connectedCallback() {',
                        "    this.style.display = 'block';",
                        "    this.style.minHeight = '40px';",
                        '  }',
                        '  load() { return Promise.resolve(); }',
                        '}',
                        "if ( ! customElements.get( 'chefs-form-viewer' ) ) {",
                        "  customElements.define( 'chefs-form-viewer', ChefsFormViewerStub );",
                        '}',
                    ].join( '\n' ),
                } );
            }
        );

        await admin.createNewPost();
        await editor.insertBlock( { name: BLOCK_NAME } );
        await ensureBlockSettingsVisible( editor, page );
        await page.getByLabel( 'Form ID' ).first().selectOption( formId );

        const postId = await editor.publishPost();
        expect( postId ).not.toBeNull();

        await becomeAnonymousVisitor( page );

        const response = await page.goto( `/?p=${ postId }` );
        expect( response ).not.toBeNull();

        const viewer = page.locator( 'chefs-form-viewer' );
        await expect( viewer ).toBeAttached();

        await viewer.evaluate( ( el ) => {
            el.dispatchEvent(
                new CustomEvent( 'formio:error', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        title: 'Bad Request',
                        status: 400,
                        detail: 'Request is missing content or is malformed',
                    },
                } )
            );
        } );

        const error = page.locator(
            '.bcew-chefs-form > .bcew-chefs-form__error'
        );
        await expect( error ).toBeVisible();
        await expect( error ).toHaveAttribute( 'role', 'alert' );
        await expect( error.getByRole( 'heading', { level: 2 } ) ).toHaveText(
            'Bad Request - 400'
        );
        await expect(
            error.getByText( 'Request is missing content or is malformed' )
        ).toBeVisible();
        await expect( viewer ).toBeAttached();

        const errorIsAboveForm = await page.evaluate( () => {
            const banner = document.querySelector(
                '.bcew-chefs-form > .bcew-chefs-form__error'
            );
            const mount = document.querySelector( '.bcew-chefs-form__mount' );
            return banner && mount && banner.nextElementSibling === mount;
        } );
        expect( errorIsAboveForm ).toBe( true );

        await viewer.evaluate( ( el ) => {
            el.dispatchEvent(
                new CustomEvent( 'formio:error', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        error: 'Submission failed',
                    },
                } )
            );
        } );

        await expect( error.getByRole( 'heading', { level: 2 } ) ).toHaveCount(
            0
        );
        await expect( error.getByText( 'Submission failed' ) ).toBeVisible();
        await expect( viewer ).toBeAttached();
        await expect(
            page.locator( '.bcew-chefs-form > .bcew-chefs-form__error' )
        ).toHaveCount( 1 );
    } );

    test( 'settings page can save, show, and delete a confirmation message', async ( {
        admin,
        page,
        requestUtils,
    } ) => {
        await ensurePluginIsActive( requestUtils );
        await clearSavedForms( admin, page );

        const formId = 'bbbbbbbb-cccc-4ddd-8eee-ffffffffffff';
        await addSavedForm( admin, page, formId, 'confirmation-api-key' );

        await expect(
            page.getByText( 'Your form has been submitted successfully' )
        ).toBeVisible();
        await expect(
            page.getByText(
                'There is no custom confirmation for this form. The generic message will be used.'
            )
        ).toBeVisible();
        await expect( page.getByLabel( 'Confirmation message' ) ).toHaveCount(
            0
        );

        await page.getByRole( 'link', { name: 'Edit confirmation' } ).click();

        const confirmationField = page.getByLabel( 'Confirmation message' );
        await expect( confirmationField ).toBeVisible();
        await expect(
            page.getByRole( 'button', { name: 'Save confirmation' } )
        ).toBeVisible();
        await expect(
            page.getByRole( 'link', { name: 'Edit confirmation' } )
        ).toHaveCount( 0 );
        await expect(
            page.getByRole( 'button', { name: 'Remove form', exact: true } )
        ).toHaveCount( 0 );
        await expect(
            page.getByRole( 'button', { name: 'Remove custom confirmation' } )
        ).toHaveCount( 0 );

        await confirmationField.fill( 'Thanks for applying.' );
        await page.getByRole( 'button', { name: 'Save confirmation' } ).click();

        await expect( page.locator( '.notice-success' ) ).toContainText(
            'Confirmation message saved.'
        );
        await expect( page.getByText( 'Thanks for applying.' ) ).toBeVisible();
        await expect( page.getByLabel( 'Confirmation message' ) ).toHaveCount(
            0
        );
        await expect(
            page.getByText(
                'There is no custom confirmation for this form. The generic message will be used.'
            )
        ).toHaveCount( 0 );
        await expect(
            page.getByRole( 'button', { name: 'Remove form', exact: true } )
        ).toBeVisible();
        await expect(
            page.getByRole( 'link', { name: 'Edit confirmation' } )
        ).toBeVisible();
        await expect(
            page.getByRole( 'button', { name: 'Remove custom confirmation' } )
        ).toBeVisible();

        page.once( 'dialog', ( dialog ) => dialog.dismiss() );
        await page
            .getByRole( 'button', { name: 'Remove custom confirmation' } )
            .click();
        await expect( page.getByText( 'Thanks for applying.' ) ).toBeVisible();

        page.once( 'dialog', ( dialog ) => dialog.accept() );
        await page
            .getByRole( 'button', { name: 'Remove custom confirmation' } )
            .click();

        await expect( page.locator( '.notice-success' ) ).toContainText(
            'Custom confirmation deleted. The generic success message will be used.'
        );
        await expect(
            page.getByText(
                'There is no custom confirmation for this form. The generic message will be used.'
            )
        ).toBeVisible();
        await expect(
            page.getByRole( 'button', { name: 'Remove custom confirmation' } )
        ).toHaveCount( 0 );
        await expect(
            page.getByRole( 'link', { name: 'Edit confirmation' } )
        ).toBeVisible();
    } );

    test( 'published page shows custom success message after submit', async ( {
        admin,
        editor,
        page,
    } ) => {
        const formId = 'cccccccc-dddd-4eee-8fff-000000000000';
        const mockBaseUrl = 'https://chefs-frontend.test/app';
        const mockToken = 'frontend-custom-success-token';
        const customMessage = 'Thanks for applying to this program.';

        await addSavedForm( admin, page, formId, 'frontend-custom-api-key' );

        await page.route(
            '**/wp-json/bcew-chefs-embed/v1/embed-config**',
            async ( route ) => {
                await route.fulfill( {
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify( {
                        token: mockToken,
                        baseUrl: mockBaseUrl,
                        confirmation: customMessage,
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
                    body: [
                        'class ChefsFormViewerStub extends HTMLElement {',
                        '  connectedCallback() {',
                        "    this.style.display = 'block';",
                        "    this.style.minHeight = '40px';",
                        '  }',
                        '  load() { return Promise.resolve(); }',
                        '}',
                        "if ( ! customElements.get( 'chefs-form-viewer' ) ) {",
                        "  customElements.define( 'chefs-form-viewer', ChefsFormViewerStub );",
                        '}',
                    ].join( '\n' ),
                } );
            }
        );

        await admin.createNewPost();
        await editor.insertBlock( { name: BLOCK_NAME } );
        await ensureBlockSettingsVisible( editor, page );
        await page.getByLabel( 'Form ID' ).first().selectOption( formId );

        const postId = await editor.publishPost();
        expect( postId ).not.toBeNull();

        await becomeAnonymousVisitor( page );

        const response = await page.goto( `/?p=${ postId }` );
        expect( response ).not.toBeNull();

        const viewer = page.locator( 'chefs-form-viewer' );
        await expect( viewer ).toBeAttached();

        await viewer.evaluate( ( el ) => {
            el.dispatchEvent(
                new CustomEvent( 'formio:submitDone', {
                    bubbles: true,
                    composed: true,
                    detail: { submission: {} },
                } )
            );
        } );

        const success = page.locator( '.bcew-chefs-form__success' );
        await expect( success ).toBeVisible();
        await expect( success.getByText( customMessage ) ).toBeVisible();
        await expect(
            success.getByText( 'Your form has been submitted successfully' )
        ).toHaveCount( 0 );
        await expect( page.locator( 'chefs-form-viewer' ) ).toHaveCount( 0 );
    } );

    test( 'published page shows an error when embed-config fails', async ( {
        admin,
        editor,
        page,
    } ) => {
        const formId = '88888888-8888-4888-8888-888888888888';

        await addSavedForm( admin, page, formId, 'frontend-error-api-key' );

        await page.route(
            '**/wp-json/bcew-chefs-embed/v1/embed-config**',
            async ( route ) => {
                await route.fulfill( {
                    status: 404,
                    contentType: 'application/json',
                    body: JSON.stringify( {
                        code: 'chefs_form_not_configured',
                        message: 'Unable to load the CHEFS form configuration.',
                    } ),
                } );
            }
        );

        await admin.createNewPost();
        await editor.insertBlock( { name: BLOCK_NAME } );
        await ensureBlockSettingsVisible( editor, page );
        await page.getByLabel( 'Form ID' ).first().selectOption( formId );

        const postId = await editor.publishPost();
        expect( postId ).not.toBeNull();

        await becomeAnonymousVisitor( page );
        await page.goto( `/?p=${ postId }` );

        await expect(
            page.getByRole( 'alert' ).filter( {
                hasText: 'Unable to load the CHEFS form configuration.',
            } )
        ).toBeVisible();
    } );
} );
