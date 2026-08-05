import { expect, test } from '@playwright/test';

test.describe( 'CHEFS Embed plugin visual regression', () => {
    test( 'dummy baseline', async ( { page } ) => {
        await page.goto( '/' );
        await expect( page ).toHaveScreenshot( 'chefs-embed-dummy.png' );
    } );
} );
