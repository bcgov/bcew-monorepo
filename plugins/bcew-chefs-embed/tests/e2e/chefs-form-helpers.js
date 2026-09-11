const { expect } = require( '@wordpress/e2e-test-utils-playwright' );

const BLOCK_NAME = 'bcew-chefs-embed/chefs-form';
const SETTINGS_PAGE_QUERY = 'page=bcew-chefs-embed-settings';

const CHEFS_FORM_VIEWER_STUB = `
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
`;

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
        const remainingForms = ( await removeButton.count() ) - 1;
        page.once( 'dialog', ( dialog ) => dialog.accept() );
        await removeButton.first().click();
        await expect( removeButton ).toHaveCount( remainingForms );
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
    await expect( settingsHeading ).toBeVisible( { timeout: 10000 } );
    const formIdField = page.getByLabel( 'Form ID' ).first();
    const apiKeyField = page.getByLabel( 'API Key' ).first();
    await expect( formIdField ).toBeVisible();
    await expect( apiKeyField ).toBeVisible();
    await formIdField.fill( formId );
    await apiKeyField.fill( apiKey );
    await page.getByRole( 'button', { name: 'Save', exact: true } ).click();
    await expect( page.locator( '.notice-success' ) ).toContainText( 'Saved.' );
};

const selectSavedFormId = async ( page, formId ) => {
    const formSelect = page.getByLabel( 'Form ID' ).first();
    await expect( formSelect ).toBeVisible();
    await expect(
        formSelect.getByRole( 'option', { name: formId } )
    ).toBeAttached();
    await formSelect.selectOption( formId );
    await expect( formSelect ).toHaveValue( formId );
};

const mockChefsFormRoutes = async (
    page,
    { token, baseUrl, confirmation }
) => {
    const configBody = { token, baseUrl };
    if ( confirmation ) {
        configBody.confirmation = confirmation;
    }
    await page.route(
        /bcew-chefs-embed(\/|%2F)v1(\/|%2F)embed-config/,
        async ( route ) => {
            await route.fulfill( {
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify( configBody ),
            } );
        }
    );
    await page.route(
        `${ baseUrl }/embed/chefs-form-viewer.min.js`,
        async ( route ) => {
            await route.fulfill( {
                status: 200,
                contentType: 'application/javascript',
                body: CHEFS_FORM_VIEWER_STUB,
            } );
        }
    );
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
    const chefsPanel = page
        .locator( '.components-panel__body' )
        .filter( { hasText: 'CHEFS Form' } )
        .first();
    await expect( chefsPanel ).toBeVisible();
    await expect( chefsPanel.locator( '.components-spinner' ) ).toHaveCount(
        0
    );
};

const selectFormAndPublish = async ( admin, editor, page, formId ) => {
    await admin.createNewPost();
    await editor.insertBlock( { name: BLOCK_NAME } );
    await ensureBlockSettingsVisible( editor, page );
    await selectSavedFormId( page, formId );
    const postId = await editor.publishPost();
    expect( postId ).not.toBeNull();
    return postId;
};

const publishFormAndVisit = async (
    admin,
    editor,
    page,
    { formId, apiKey, token, baseUrl, confirmation }
) => {
    await addSavedForm( admin, page, formId, apiKey );
    await mockChefsFormRoutes( page, { token, baseUrl, confirmation } );
    const postId = await selectFormAndPublish( admin, editor, page, formId );
    await page.context().clearCookies();
    const response = await page.goto( `/?p=${ postId }` );
    expect( response ).not.toBeNull();
    return response;
};

const setup = async ( { admin, page } ) => {
    await clearSavedForms( admin, page );
};

module.exports = {
    BLOCK_NAME,
    addSavedForm,
    clearSavedForms,
    ensureBlockSettingsVisible,
    mockChefsFormRoutes,
    publishFormAndVisit,
    selectFormAndPublish,
    selectSavedFormId,
    setup,
};
