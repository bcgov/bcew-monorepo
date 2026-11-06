import { expect } from '@playwright/test';
import { test } from '@bcew-monorepo/e2e';

test.describe( 'Notification Banner', () => {
    test( 'has no accessibility violations', async ( { admin, page, axe } ) => {
        await admin.visitAdminPage( 'admin.php?page=dswp-notification-menu' );
        await page.getByRole( 'radio', { name: 'Enable' } ).check();
        await page.getByRole( 'textbox' ).fill( 'Accessibility test banner' );
        await page.getByRole( 'radio', { name: 'Warning' } ).check();
        await page.getByRole( 'button', { name: 'Save Settings' } ).click();
        await expect(
            page.locator( '.notice-success, .updated.notice' ).first()
        ).toBeVisible();

        await page.goto( '/' );

        const banner = page.locator( '#dswp-notification-banner' );
        await expect( banner ).toBeVisible();

        const { violations } = await axe
            .include( '#dswp-notification-banner' )
            .analyze();

        expect( violations ).toEqual( [] );
    } );
} );
