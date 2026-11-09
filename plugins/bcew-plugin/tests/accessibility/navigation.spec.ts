import { expect } from '@playwright/test';
import { test } from '@bcew-monorepo/e2e';

test( 'Navigation has no Axe violations', async ( {
    page,
    requestUtils,
    axe,
} ) => {
    let navigationId: number | undefined;
    let pageId: number | undefined;

    try {
        const navigation = await requestUtils.rest( {
            method: 'POST',
            path: '/wp/v2/navigation',
            data: {
                title: 'Navigation accessibility test',
                status: 'publish',
                content:
                    '<!-- wp:navigation-link {"label":"Home","url":"/","kind":"custom"} /-->\n<!-- wp:navigation-link {"label":"About","url":"/about/","kind":"custom"} /-->',
            },
        } );
        navigationId = navigation.id;

        const testPage = await requestUtils.rest( {
            method: 'POST',
            path: '/wp/v2/pages',
            data: {
                title: 'Navigation accessibility test',
                status: 'publish',
                content: `<!-- wp:design-system-wordpress-plugin/navigation {"ref":${ navigationId }} /-->`,
            },
        } );
        pageId = testPage.id;

        await page.goto( `/?page_id=${ pageId }` );
        const navigationBlock = page.locator(
            '.wp-block-design-system-wordpress-plugin-navigation'
        );
        await expect( navigationBlock ).toBeVisible();

        const { violations } = await axe
            .include( '.wp-block-design-system-wordpress-plugin-navigation' )
            .analyze();

        expect( violations ).toEqual( [] );
    } finally {
        if ( pageId ) {
            await requestUtils.rest( {
                method: 'DELETE',
                path: `/wp/v2/pages/${ pageId }`,
                data: { force: true },
            } );
        }
        if ( navigationId ) {
            await requestUtils.rest( {
                method: 'DELETE',
                path: `/wp/v2/navigation/${ navigationId }`,
                data: { force: true },
            } );
        }
    }
} );
