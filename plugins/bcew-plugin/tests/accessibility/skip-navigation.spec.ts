import { expect } from '@playwright/test';
import { test } from '@bcew-monorepo/e2e';

test.describe( 'Skip Navigation', () => {
    const linkNames = [
        'Skip to main content',
        'Skip to main navigation',
        'Accessibility Statement',
    ];

    test.beforeEach( async ( { page } ) => {
        await page.goto( '/' );
        await expect( page.locator( '.dswp-skip-nav-list' ) ).toBeAttached();
        await expect(
            page.locator( '.dswp-skip-nav-list' ).getByRole( 'link' )
        ).toHaveText( linkNames );
    } );

    test( 'has no Axe violations in its default state', async ( { axe } ) => {
        const { violations } = await axe
            .include( '.dswp-skip-nav-list' )
            .analyze();

        expect( violations ).toEqual( [] );
    } );

    for ( const name of linkNames ) {
        test( `has no Axe violations with "${ name }" focused`, async ( {
            page,
            axe,
        } ) => {
            const link = page
                .locator( '.dswp-skip-nav-list' )
                .getByRole( 'link', { name, exact: true } );

            await link.focus();
            await expect( link ).toBeFocused();
            await expect( link ).toBeVisible();
            await expect
                .poll( async () => ( await link.boundingBox() )?.x )
                .toBe( 0 );
            await expect( link ).toBeInViewport( { ratio: 1 } );

            const { violations } = await axe
                .include( '.dswp-skip-nav-list' )
                .analyze();

            expect( violations ).toEqual( [] );
        } );
    }
} );
