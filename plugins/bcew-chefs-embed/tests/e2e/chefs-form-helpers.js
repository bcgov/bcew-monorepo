const { expect } = require( '@wordpress/e2e-test-utils-playwright' );

const BLOCK_NAME = 'bcew-chefs-embed/chefs-form';
const SETTINGS_PAGE_QUERY = 'page=bcew-chefs-embed-settings';

const getChefsFormViewerStub = ( loadError ) => `
	class ChefsFormViewerStub extends HTMLElement {
		connectedCallback() {
			this.style.display = 'block';
			this.style.minHeight = '40px';
		}
		load() {
            this.setAttribute( 'data-formio-js', this.endpoints?.formioJs || '' );
            return Promise.resolve().then( () => {
                if ( ${ loadError ? JSON.stringify( loadError ) : 'null' } ) {
                    this.dispatchEvent( new CustomEvent( 'formio:error', {
                        bubbles: true,
                        composed: true,
                        detail: ${
                            loadError ? JSON.stringify( loadError ) : 'null'
                        },
                    } ) );
                }
                return undefined;
            } );
		}
	}
	if ( ! customElements.get( 'chefs-form-viewer' ) ) {
		customElements.define( 'chefs-form-viewer', ChefsFormViewerStub );
	}
`;

const assertSettingsPageAccess = async ( page ) => {
    const settingsHeading = page.getByRole( 'heading', {
        name: 'CHEFS Settings',
    } );
    const unauthorizedMessage = page.getByText(
        /You do not have sufficient permissions|Unauthorized|Forbidden/i
    );
    if ( 0 === ( await settingsHeading.count() ) ) {
        await expect( unauthorizedMessage ).toHaveCount( 0 );
        return false;
    }
    await expect( settingsHeading ).toBeVisible( { timeout: 10000 } );
    return true;
};

const ensureElementExpanded = async ( element ) => {
    if ( 'false' === ( await element.getAttribute( 'aria-expanded' ) ) ) {
        await element.click();
    }
};

const clearSavedForms = async ( admin, page ) => {
    await admin.visitAdminPage( 'admin.php', SETTINGS_PAGE_QUERY );
    await expect( page ).toHaveURL(
        /\/wp-admin\/admin\.php\?page=bcew-chefs-embed-settings/
    );
    if ( ! ( await assertSettingsPageAccess( page ) ) ) {
        return;
    }

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
    const canAccess = await assertSettingsPageAccess( page );
    if ( ! canAccess ) {
        throw new Error(
            'CHEFS settings page is not accessible (permission denied). ' +
                'Verify the test user can manage options and access admin pages.'
        );
    }
    const formIdField = page.getByLabel( 'Form ID / URL' ).first();
    const apiKeyField = page.getByLabel( 'API Key' ).first();
    await expect( formIdField ).toBeVisible();
    await expect( apiKeyField ).toBeVisible();
    await formIdField.fill( formId );
    await apiKeyField.fill( apiKey );
    await page.getByRole( 'button', { name: 'Save', exact: true } ).click();
    await expect(
        page.locator( '.notice-success' ).filter( { hasText: 'Saved.' } )
    ).toBeVisible();
};

const selectSavedFormId = async ( page, formId ) => {
    const formSelect = page.getByLabel( 'Form name' ).first();
    await expect( formSelect ).toBeVisible();
    await expect(
        formSelect.locator( `option[value="${ formId }"]` )
    ).toBeAttached();
    await formSelect.selectOption( formId );
    await expect( formSelect ).toHaveValue( formId );
};

const mockChefsFormRoutes = async (
    page,
    { token, baseUrl, confirmation, loadError }
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
                body: getChefsFormViewerStub( loadError ),
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
    await ensureElementExpanded( settingsButton );
    const chefsPanelButton = page
        .getByRole( 'button', { name: 'CHEFS Form' } )
        .first();
    if ( ( await chefsPanelButton.count() ) > 0 ) {
        await ensureElementExpanded( chefsPanelButton );
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
    { formId, apiKey, token, baseUrl, confirmation, loadError }
) => {
    await addSavedForm( admin, page, formId, apiKey );
    await mockChefsFormRoutes( page, {
        token,
        baseUrl,
        confirmation,
        loadError,
    } );
    const postId = await selectFormAndPublish( admin, editor, page, formId );
    await page.context().clearCookies();
    const response = await page.goto( `/?p=${ postId }` );
    expect( response ).not.toBeNull();
    return response;
};

const assertBlockVisible = async ( editor ) => {
    const block = editor.canvas
        .locator( `[data-type="${ BLOCK_NAME }"]` )
        .first();
    await expect( block ).toBeVisible();
    return block;
};

const getChefsBlock = async ( editor ) => {
    const blocks = await editor.getBlocks();
    return blocks.find( ( block ) => block.name === BLOCK_NAME );
};

const getFormSelect = ( page ) => page.getByLabel( 'Form name' ).first();

const getFormOptionValues = async ( page ) => {
    const formSelect = getFormSelect( page );
    return formSelect
        .locator( 'option' )
        .evaluateAll( ( options ) =>
            options.map( ( option ) => option.value )
        );
};

const getFormOptionLabels = async ( page ) => {
    const formSelect = getFormSelect( page );
    return formSelect
        .locator( 'option' )
        .evaluateAll( ( options ) =>
            options.map( ( option ) => option.textContent )
        );
};

const getFormViewer = async ( page ) => {
    return page.locator( 'chefs-form-viewer' );
};

const getFormBlock = async ( page ) => {
    return page.locator( '.bcew-chefs-form' ).first();
};

const getFormSuccess = async ( page ) => {
    return page.locator( '.bcew-chefs-form__success' );
};

const getFormError = async ( page ) => {
    return page.locator( '.bcew-chefs-form > .bcew-chefs-form__error' );
};

const dispatchFormioEvent = async ( viewer, eventName, detail ) => {
    await viewer.evaluate(
        ( element, payload ) => {
            element.dispatchEvent(
                new CustomEvent( payload.eventName, {
                    bubbles: true,
                    composed: true,
                    detail: payload.detail,
                } )
            );
        },
        { eventName, detail }
    );
};

const getFormIdField = async ( page ) => {
    return page.getByLabel( 'Form ID' ).first();
};

const getApiKeyField = async ( page ) => {
    return page.getByLabel( 'API Key' ).first();
};

const getConfirmationMessageField = async ( page ) => {
    return page.getByLabel( 'Confirmation message' );
};

const getSaveButton = async ( page ) => {
    return page.getByRole( 'button', { name: 'Save', exact: true } );
};

const getRemoveFormButton = async ( page ) => {
    return page.getByRole( 'button', { name: 'Remove form', exact: true } );
};

const getErrorNotice = async ( page ) => {
    return page.locator( '.notice-error' );
};

module.exports = {
    BLOCK_NAME,
    addSavedForm,
    assertBlockVisible,
    assertSettingsPageAccess,
    clearSavedForms,
    dispatchFormioEvent,
    ensureBlockSettingsVisible,
    ensureElementExpanded,
    getApiKeyField,
    getChefsBlock,
    getConfirmationMessageField,
    getErrorNotice,
    getFormBlock,
    getFormError,
    getFormIdField,
    getFormOptionLabels,
    getFormOptionValues,
    getFormSelect,
    getFormSuccess,
    getFormViewer,
    getRemoveFormButton,
    getSaveButton,
    mockChefsFormRoutes,
    publishFormAndVisit,
    selectFormAndPublish,
    selectSavedFormId,
};
