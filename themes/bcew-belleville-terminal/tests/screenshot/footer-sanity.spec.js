/* global getComputedStyle */

import { expect, test } from '@playwright/test';

const DESKTOP_VIEWPORT = { width: 1440, height: 1200 };
const MOBILE_VIEWPORT = { width: 375, height: 812 };
const EXPECTED_LOGO_WIDTHS = [ 145, 146, 145 ];

const openHomePage = async ( page, viewport ) => {
    await page.setViewportSize( viewport );
    await page.goto( '/' );
    await page.waitForLoadState( 'networkidle' );
};

const collectFooterMetrics = async ( page ) => {
    return page.evaluate( () => {
        const viewportWidth = window.innerWidth;
        const footerShell = document.querySelector(
            '.bcgov-footer-container.footer-shell'
        );
        const territorialAcknowledgement = document.querySelector(
            '.territorial-acknowledgement'
        );
        const linksColumn = document.querySelector( '.footer-links-column' );
        const linksColumnsContainer = document.querySelector(
            '.footer-links-column .wp-block-columns'
        );
        const logoFigures = Array.from(
            document.querySelectorAll( '.footer-logos .footer-logo' )
        );

        let footerHorizontalOverflowPixels = null;

        if ( footerShell ) {
            const footerElements = [
                footerShell,
                ...footerShell.querySelectorAll( '*' ),
            ];

            let maxRightEdge = -Infinity;
            let minLeftEdge = Infinity;

            for ( const footerElement of footerElements ) {
                const footerRect = footerElement.getBoundingClientRect();

                if ( 0 === footerRect.width && 0 === footerRect.height ) {
                    continue;
                }

                maxRightEdge = Math.max( maxRightEdge, footerRect.right );
                minLeftEdge = Math.min( minLeftEdge, footerRect.left );
            }

            const rightOverflow = Math.max( 0, maxRightEdge - viewportWidth );
            const leftOverflow = Math.max( 0, -minLeftEdge );

            footerHorizontalOverflowPixels = Math.round(
                rightOverflow + leftOverflow
            );
        }

        const measuredLogoWidths = logoFigures.map( ( figureElement ) => {
            return Math.round( figureElement.getBoundingClientRect().width );
        } );

        const linksColumnWidth = linksColumn
            ? Math.round( linksColumn.getBoundingClientRect().width )
            : null;

        const linksColumnsDisplay = linksColumnsContainer
            ? getComputedStyle( linksColumnsContainer ).display
            : null;

        return {
            hasFooterShell: Boolean( footerShell ),
            hasTerritorialAcknowledgement: Boolean(
                territorialAcknowledgement
            ),
            logoCount: logoFigures.length,
            measuredLogoWidths,
            linksColumnWidth,
            linksColumnsDisplay,
            footerHorizontalOverflowPixels,
        };
    } );
};

test.describe( 'footer sanity', () => {
    test( 'desktop footer layout remains stable', async ( { page } ) => {
        await openHomePage( page, DESKTOP_VIEWPORT );

        const footerMetrics = await collectFooterMetrics( page );

        expect( footerMetrics.hasFooterShell ).toBe( true );
        expect( footerMetrics.hasTerritorialAcknowledgement ).toBe( true );
        expect( footerMetrics.logoCount ).toBe( 3 );
        expect( footerMetrics.measuredLogoWidths ).toEqual(
            EXPECTED_LOGO_WIDTHS
        );
        expect( footerMetrics.linksColumnWidth ).toBe( 328 );
        expect( footerMetrics.linksColumnsDisplay ).toBe( 'flex' );
        expect(
            footerMetrics.footerHorizontalOverflowPixels
        ).toBeLessThanOrEqual( 1 );
    } );

    test( 'mobile footer layout remains stable', async ( { page } ) => {
        await openHomePage( page, MOBILE_VIEWPORT );

        const footerMetrics = await collectFooterMetrics( page );

        expect( footerMetrics.hasFooterShell ).toBe( true );
        expect( footerMetrics.hasTerritorialAcknowledgement ).toBe( true );
        expect( footerMetrics.logoCount ).toBe( 3 );
        expect( footerMetrics.measuredLogoWidths ).toEqual(
            EXPECTED_LOGO_WIDTHS
        );
        expect( footerMetrics.linksColumnWidth ).toBe( 328 );
        expect( footerMetrics.linksColumnsDisplay ).toBe( 'grid' );
        expect(
            footerMetrics.footerHorizontalOverflowPixels
        ).toBeLessThanOrEqual( 1 );
    } );
} );
