const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

/**
 * Integration tests for CHEFS Admin Settings.
 *
 * Note: WordPress submit_button() renders <input type="submit">, not <button>,
 * so selectors use input[type="submit"][value="..."] throughout.
 */

test.describe( 'CHEFS Admin Settings', () => {
    const TEST_FORM_ID = '12345678-1234-4567-8901-123456789012';
    const TEST_API_KEY = 'test-api-key-integration-' + Date.now();

    test( 'Settings link appears in plugin row on plugins page', async ( {
        admin,
        page,
    } ) => {
        await admin.visitAdminPage( 'plugins.php' );

        const settingsLink = page.locator(
            'tr[data-plugin="bcew-chefs-embed/bcew-chefs-embed.php"] a[href*="page=bcew-chefs-embed-settings"]'
        );
        await expect( settingsLink ).toBeVisible();
        await expect( settingsLink ).toContainText( 'Settings' );
    } );

    test( 'CHEFS menu appears in wp-admin sidebar', async ( {
        admin,
        page,
    } ) => {
        await admin.visitAdminPage( 'index.php' );

        const chefsMenu = page.locator(
            'a[href*="page=bcew-chefs-embed-settings"]'
        );
        await expect( chefsMenu ).toBeVisible();
        await expect( chefsMenu ).toContainText( 'CHEFS Forms' );
    } );

    test( 'Settings page displays with correct UI elements', async ( {
        admin,
        page,
    } ) => {
        await admin.visitAdminPage(
            'admin.php?page=bcew-chefs-embed-settings'
        );

        await expect( page.locator( 'h1' ) ).toContainText( 'CHEFS Settings' );
        await expect( page.locator( 'p.description' ) ).toContainText(
            'Form IDs are stored for block lookup'
        );

        // Main form is always the first form on the page
        const mainForm = page.locator( 'form' ).first();

        const formIdInput = mainForm.locator( 'input[name="form_id"]' );
        await expect( formIdInput ).toBeVisible();
        await expect( formIdInput ).toHaveAttribute( 'required', '' );

        const apiKeyInput = mainForm.locator( 'input[name="api_key"]' );
        await expect( apiKeyInput ).toBeVisible();
        await expect( apiKeyInput ).toHaveAttribute( 'required', '' );
        await expect( apiKeyInput ).toHaveAttribute( 'type', 'password' );

        // submit_button() renders <input type="submit">, not <button>
        await expect(
            page.locator( 'input[type="submit"][value="Save"]' )
        ).toBeVisible();
    } );

    test( 'Can submit credentials form and see success message', async ( {
        admin,
        page,
    } ) => {
        await admin.visitAdminPage(
            'admin.php?page=bcew-chefs-embed-settings'
        );

        const mainForm = page.locator( 'form' ).first();
        await mainForm.locator( 'input[name="form_id"]' ).fill( TEST_FORM_ID );
        await mainForm.locator( 'input[name="api_key"]' ).fill( TEST_API_KEY );
        await page.locator( 'input[type="submit"][value="Save"]' ).click();

        await page.waitForURL( /chefs_saved=1/ );
        await expect(
            page.locator( '.notice-success' ).filter( { hasText: 'Saved' } )
        ).toBeVisible();
    } );

    test( 'Saved credentials appear in "Configured Forms" list', async ( {
        admin,
        page,
    } ) => {
        await admin.visitAdminPage(
            'admin.php?page=bcew-chefs-embed-settings'
        );

        const mainForm = page.locator( 'form' ).first();
        await mainForm.locator( 'input[name="form_id"]' ).fill( TEST_FORM_ID );
        await mainForm.locator( 'input[name="api_key"]' ).fill( TEST_API_KEY );
        await page.locator( 'input[type="submit"][value="Save"]' ).click();

        await page.waitForURL( /chefs_saved=1/ );

        await expect(
            page.locator( 'h2:has-text("Configured Forms")' )
        ).toBeVisible();
        await expect(
            page.locator( 'code:has-text("' + TEST_FORM_ID + '")' )
        ).toBeVisible();

        // Remove button for this row is <input type="submit" value="Remove">
        await expect(
            page.locator(
                'form:has(input[value="' +
                    TEST_FORM_ID +
                    '"]) input[type="submit"][value="Remove"]'
            )
        ).toBeVisible();
    } );

    test( 'Duplicate Form ID updates rather than creating a second record', async ( {
        admin,
        page,
    } ) => {
        const uniqueFormId = 'aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee';

        // Save first
        await admin.visitAdminPage(
            'admin.php?page=bcew-chefs-embed-settings'
        );
        const firstForm = page.locator( 'form' ).first();
        await firstForm.locator( 'input[name="form_id"]' ).fill( uniqueFormId );
        await firstForm
            .locator( 'input[name="api_key"]' )
            .fill( 'first-key-' + Date.now() );
        await page.locator( 'input[type="submit"][value="Save"]' ).click();
        await page.waitForURL( /chefs_saved=1/ );

        // Save same Form ID again
        await admin.visitAdminPage(
            'admin.php?page=bcew-chefs-embed-settings'
        );
        const secondForm = page.locator( 'form' ).first();
        await secondForm
            .locator( 'input[name="form_id"]' )
            .fill( uniqueFormId );
        await secondForm
            .locator( 'input[name="api_key"]' )
            .fill( 'second-key-' + Date.now() );
        await page.locator( 'input[type="submit"][value="Save"]' ).click();

        await page.waitForURL( /chefs_saved=1/ );

        // Only one row should exist for this Form ID (UNIQUE constraint enforced via upsert)
        await expect(
            page.locator( '.notice-success' ).filter( { hasText: 'Saved' } )
        ).toBeVisible();
        await expect(
            page.locator( 'code:has-text("' + uniqueFormId + '")' )
        ).toHaveCount( 1 );
    } );

    test( 'Credentials stored with user_id and datetime', async ( {
        admin,
        page,
    } ) => {
        await admin.visitAdminPage(
            'admin.php?page=bcew-chefs-embed-settings'
        );

        await expect(
            page.locator( 'h1:has-text("CHEFS Settings")' )
        ).toBeVisible();

        // Save a credential so created_at/user_id are written
        const mainForm = page.locator( 'form' ).first();
        await mainForm
            .locator( 'input[name="form_id"]' )
            .fill( 'eeeeeeee-ffff-4aaa-bbbb-cccccccccccc' );
        await mainForm
            .locator( 'input[name="api_key"]' )
            .fill( 'datetime-test-key-' + Date.now() );
        await page.locator( 'input[type="submit"][value="Save"]' ).click();

        // Success confirms the row was written (including user_id & timestamps)
        await page.waitForURL( /chefs_saved=1/ );
        await expect(
            page.locator( '.notice-success' ).filter( { hasText: 'Saved' } )
        ).toBeVisible();
    } );

    test( 'Credentials are readable by Form ID', async ( { admin, page } ) => {
        const readableFormId = 'cccccccc-dddd-4eee-ffff-aaaaaaaaaaaa';

        await admin.visitAdminPage(
            'admin.php?page=bcew-chefs-embed-settings'
        );
        const mainForm = page.locator( 'form' ).first();
        await mainForm
            .locator( 'input[name="form_id"]' )
            .fill( readableFormId );
        await mainForm
            .locator( 'input[name="api_key"]' )
            .fill( 'readable-key-' + Date.now() );
        await page.locator( 'input[type="submit"][value="Save"]' ).click();

        await page.waitForURL( /chefs_saved=1/ );
        await page.reload();

        // Form ID is listed in "Configured Forms" — readable by Form ID
        await expect(
            page.locator( 'code:has-text("' + readableFormId + '")' )
        ).toBeVisible();
    } );

    test( 'Delete button removes credentials from list', async ( {
        admin,
        page,
    } ) => {
        const deleteFormId = 'dddddddd-eeee-4fff-aaaa-bbbbbbbbbbbb';

        await admin.visitAdminPage(
            'admin.php?page=bcew-chefs-embed-settings'
        );
        const mainForm = page.locator( 'form' ).first();
        await mainForm.locator( 'input[name="form_id"]' ).fill( deleteFormId );
        await mainForm
            .locator( 'input[name="api_key"]' )
            .fill( 'delete-test-key-' + Date.now() );
        await page.locator( 'input[type="submit"][value="Save"]' ).click();
        await page.waitForURL( /chefs_saved=1/ );

        // Click Remove for this row
        await page
            .locator(
                'form:has(input[value="' +
                    deleteFormId +
                    '"]) input[type="submit"][value="Remove"]'
            )
            .click();

        await page.waitForURL( /chefs_deleted=1/ );
        await expect(
            page.locator( '.notice-success' ).filter( { hasText: 'Removed' } )
        ).toBeVisible();
        await expect(
            page.locator( 'code:has-text("' + deleteFormId + '")' )
        ).not.toBeVisible();
    } );

    test( 'Form ID field is required', async ( { admin, page } ) => {
        await admin.visitAdminPage(
            'admin.php?page=bcew-chefs-embed-settings'
        );

        await expect(
            page.locator( 'form' ).first().locator( 'input[name="form_id"]' )
        ).toHaveAttribute( 'required', '' );
    } );

    test( 'API Key field is required', async ( { admin, page } ) => {
        await admin.visitAdminPage(
            'admin.php?page=bcew-chefs-embed-settings'
        );

        await expect(
            page.locator( 'form' ).first().locator( 'input[name="api_key"]' )
        ).toHaveAttribute( 'required', '' );
    } );

    test( 'API Key input is password type', async ( { admin, page } ) => {
        await admin.visitAdminPage(
            'admin.php?page=bcew-chefs-embed-settings'
        );

        await expect(
            page.locator( 'form' ).first().locator( 'input[name="api_key"]' )
        ).toHaveAttribute( 'type', 'password' );
    } );

    test( 'Nonce field is present in save form', async ( { admin, page } ) => {
        await admin.visitAdminPage(
            'admin.php?page=bcew-chefs-embed-settings'
        );

        const mainForm = page.locator( 'form' ).first();

        const nonceField = mainForm.locator( 'input[name="_wpnonce"]' );
        await expect( nonceField ).toBeAttached();

        const nonceValue = await nonceField.getAttribute( 'value' );
        expect( nonceValue ).toBeTruthy();
        expect( nonceValue.length ).toBeGreaterThan( 0 );

        await expect(
            mainForm.locator( 'input[name="action"][value="bcew_chefs_save"]' )
        ).toBeAttached();
    } );
} );
