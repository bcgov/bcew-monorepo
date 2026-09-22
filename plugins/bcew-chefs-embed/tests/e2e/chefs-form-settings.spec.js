const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );
const {
    addSavedForm,
    clearSavedForms,
    getApiKeyField,
    getConfirmationMessageField,
    getErrorNotice,
    getFormIdField,
    getRemoveFormButton,
    getSaveButton,
} = require( './chefs-form-helpers' );

test.describe( 'CHEFS Form settings', () => {
    test( 'explains how to update an existing form API key beside the form fields', async ( {
        admin,
        page,
    } ) => {
        await clearSavedForms( admin, page );
        await expect(
            page.getByRole( 'heading', { name: 'Add or update a form' } )
        ).toBeVisible();
        await expect(
            page.getByText(
                'To update a saved form, enter its existing Form ID and the replacement API key.'
            )
        ).toBeVisible();
        await expect(
            page.getByText(
                'Use the same Form ID to update an existing saved form.'
            )
        ).toBeVisible();
        await expect(
            page.getByText(
                'For a new form, enter its API key. To update an existing form, enter the replacement API key.'
            )
        ).toBeVisible();
    } );

    test( 'valid credentials are saved and shown in configured forms', async ( {
        admin,
        page,
    } ) => {
        await clearSavedForms( admin, page );
        const formId = '11111111-1111-4111-8111-111111111111';

        await addSavedForm( admin, page, formId, 'api-key-one' );

        await expect( page.getByText( formId, { exact: true } ) ).toBeVisible();
        await expect( await getRemoveFormButton( page ) ).toHaveCount( 1 );
    } );

    test( 'updates an API key without changing saved form settings', async ( {
        admin,
        page,
    } ) => {
        await clearSavedForms( admin, page );
        const formId = '11111111-1111-4111-8111-111111111111';
        const confirmation = 'Thanks for applying.';

        await addSavedForm( admin, page, formId, 'api-key-one' );
        await page.getByRole( 'link', { name: 'Edit confirmation' } ).click();
        const confirmationField = await getConfirmationMessageField( page );
        await confirmationField.fill( confirmation );
        await page.getByRole( 'button', { name: 'Save confirmation' } ).click();
        await expect( page.getByText( confirmation ) ).toBeVisible();

        const formIdField = await getFormIdField( page );
        const apiKeyField = await getApiKeyField( page );
        const saveButton = await getSaveButton( page );
        await formIdField.fill( formId );
        await apiKeyField.fill( 'replacement-api-key' );
        await saveButton.click();

        await expect(
            page
                .locator( '.notice-success' )
                .filter( { hasText: 'Form updated.' } )
        ).toBeVisible();
        await expect( page.getByText( 'E2E test form' ) ).toBeVisible();
        await expect( page.getByText( confirmation ) ).toBeVisible();
    } );

    test( 'settings page can save, show, and delete a confirmation message', async ( {
        admin,
        page,
    } ) => {
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
        const confirmationField = await getConfirmationMessageField( page );
        await expect( confirmationField ).toHaveCount( 0 );
        await page.getByRole( 'link', { name: 'Edit confirmation' } ).click();
        await expect( confirmationField ).toBeVisible();
        await expect(
            page.getByRole( 'button', { name: 'Save confirmation' } )
        ).toBeVisible();
        await confirmationField.fill( 'Thanks for applying.' );
        await page.getByRole( 'button', { name: 'Save confirmation' } ).click();
        const successNotice = page
            .locator( '.notice-success' )
            .filter( { hasText: /confirmation/i } )
            .first();
        await expect( successNotice ).toContainText(
            'Confirmation message saved.'
        );
        await expect( page.getByText( 'Thanks for applying.' ) ).toBeVisible();
        await expect( confirmationField ).toHaveCount( 0 );
        await expect(
            page.getByText(
                'There is no custom confirmation for this form. The generic message will be used.'
            )
        ).toHaveCount( 0 );
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
        await expect( successNotice ).toContainText(
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

    test( 'form title is fetched and displayed in the settings table', async ( {
        admin,
        page,
    } ) => {
        await clearSavedForms( admin, page );
        const formId = '11111111-1111-4111-8111-111111111111';

        await addSavedForm( admin, page, formId, 'api-key-one' );

        // Verify form title from CHEFS API is displayed in the table
        await expect( page.getByText( 'E2E test form' ) ).toBeVisible();
        await expect( page.getByText( formId, { exact: true } ) ).toBeVisible();
    } );

    test( 'invalid credentials show an error and do not replace a saved form', async ( {
        admin,
        page,
    } ) => {
        await clearSavedForms( admin, page );
        const formId = 'cccccccc-dddd-4eee-8fff-000000000000';
        await addSavedForm( admin, page, formId, 'original-api-key' );

        await admin.visitAdminPage(
            'admin.php',
            'page=bcew-chefs-embed-settings'
        );
        const formIdField = await getFormIdField( page );
        const apiKeyField = await getApiKeyField( page );
        await formIdField.fill( formId );
        await apiKeyField.fill( 'invalid-test-key' );
        const saveButton = await getSaveButton( page );
        await saveButton.click();

        const errorNotice = await getErrorNotice( page );
        await expect( errorNotice ).toContainText(
            'could not be verified together'
        );
        await expect( await getRemoveFormButton( page ) ).toHaveCount( 1 );

        await clearSavedForms( admin, page );
    } );
} );
