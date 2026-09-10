const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );
const { addSavedForm, setup } = require( './chefs-form-helpers' );

test.describe( 'CHEFS Form settings', () => {
    test( 'settings page can save, show, and delete a confirmation message', async ( {
        admin,
        page,
    } ) => {
        await setup( { admin, page } );
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
} );
