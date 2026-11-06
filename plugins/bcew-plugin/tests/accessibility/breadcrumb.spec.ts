import { expect } from '@playwright/test';
import { test } from '@bcew-monorepo/e2e';

test.describe( 'Breadcrumb', () => {
    const BLOCK_NAME = 'design-system-wordpress-plugin/breadcrumb';

    test.afterEach( async ( { requestUtils } ) => {
        await requestUtils.deleteAllPages();
    } );

    test( 'has no Axe accessibility violations on the frontend', async ( {
        page,
        requestUtils,
        axe,
    } ) => {
        const parentPage = await requestUtils.rest( {
            method: 'POST',
            path: '/wp/v2/pages',
            data: {
                title: 'Breadcrumb parent',
                status: 'publish',
            },
        } );
        const childPage = await requestUtils.rest( {
            method: 'POST',
            path: '/wp/v2/pages',
            data: {
                title: 'Breadcrumb child',
                status: 'publish',
                parent: parentPage.id,
                content: `<!-- wp:${ BLOCK_NAME } /-->`,
            },
        } );

        await page.goto( `/?page_id=${ childPage.id }` );
        const breadcrumb = page.locator(
            '.wp-block-design-system-wordpress-plugin-breadcrumb'
        );
        await expect( breadcrumb ).toBeVisible();

        const { violations } = await axe
            .include( '.wp-block-design-system-wordpress-plugin-breadcrumb' )
            .analyze();

        expect( violations ).toEqual( [] );
    } );
} );
