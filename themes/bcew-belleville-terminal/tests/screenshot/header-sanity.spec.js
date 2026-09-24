import { expect, test } from '@playwright/test';

const DESKTOP_VIEWPORT = { width: 1440, height: 1200 };
const MOBILE_VIEWPORT = { width: 375, height: 812 };
const HEADER_SECTION_SELECTORS = [
    '.bcew-header-top',
    '.bcew-header-navigation',
    '.bcew-header-breadcrumbs',
];

const openHomePage = async ( page, viewport ) => {
    await page.setViewportSize( viewport );
    await page.goto( '/' );
    await page.waitForLoadState( 'networkidle' );
};

const collectHeaderMetrics = async ( page ) => {
    return page.evaluate( ( sectionSelectors ) => {
        const viewportWidth = window.innerWidth;

        return sectionSelectors.map( ( sectionSelector ) => {
            const sectionElement = document.querySelector( sectionSelector );

            if ( ! sectionElement ) {
                return null;
            }

            const sectionRect = sectionElement.getBoundingClientRect();
            const contentElement = sectionElement.firstElementChild;
            const contentRect = contentElement?.getBoundingClientRect();
            const sectionStyle = getComputedStyle( sectionElement );

            return {
                bottomBorderWidth: parseFloat( sectionStyle.borderBottomWidth ),
                bottomBorderStyle: sectionStyle.borderBottomStyle,
                contentWidth: Math.round( contentRect?.width ?? 0 ),
                sectionLeft: Math.round( sectionRect.left ),
                sectionRight: Math.round( sectionRect.right ),
                sectionWidth: Math.round( sectionRect.width ),
                viewportWidth,
            };
        } );
    }, HEADER_SECTION_SELECTORS );
};

test.describe( 'header sanity', () => {
    for ( const viewport of [ DESKTOP_VIEWPORT, MOBILE_VIEWPORT ] ) {
        test( `header sections span the viewport at ${ viewport.width }px`, async ( {
            page,
        } ) => {
            await openHomePage( page, viewport );

            const headerMetrics = await collectHeaderMetrics( page );

            expect( headerMetrics ).toHaveLength( 3 );

            for ( const sectionMetrics of headerMetrics ) {
                expect( sectionMetrics ).not.toBeNull();
                expect( sectionMetrics.bottomBorderStyle ).toBe( 'solid' );
                expect( sectionMetrics.bottomBorderWidth ).toBe( 1 );
                expect( sectionMetrics.sectionLeft ).toBe( 0 );
                expect( sectionMetrics.sectionRight ).toBe(
                    sectionMetrics.viewportWidth
                );
                expect( sectionMetrics.contentWidth ).toBeLessThan(
                    sectionMetrics.sectionWidth
                );
            }
        } );
    }
} );
