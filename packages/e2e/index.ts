/**
 * Shared Playwright test utilities for the BCEW monorepo.
 *
 * Common helpers for e2e tests across themes and plugins.
 */

import { expect, Page } from '@playwright/test';
import { test } from '@wordpress/e2e-test-utils-playwright';
import config from './playwright.config';

/**
 * Common page interactions.
 */
export class PageHelpers {
    page: Page;

    constructor( page: Page ) {
        this.page = page;
    }

    /**
     * Navigate to a page and wait for load.
     * @param {string} url Url to navigate to.
     */
    async goto( url: string ) {
        await this.page.goto( url );
        await this.page.waitForLoadState( 'networkidle' );
    }

    /**
     * Check if element is visible.
     * @param {any} selector Selector to select.
     * @return {boolean} Whether the element is visible.
     */
    async isVisible( selector: any ) {
        return await this.page.isVisible( selector );
    }

    /**
     * Take a screenshot with timestamp.
     * @param {string} name Screenshot file name.
     */
    async takeScreenshot( name: string ) {
        const timestamp = new Date().toISOString().replace( /[:.]/g, '-' );
        await this.page.screenshot( {
            path: `screenshots/${ name }-${ timestamp }.png`,
        } );
    }
}

/**
 * WordPress-specific helpers.
 */
export class WordPressHelpers extends PageHelpers {
    /**
     * Log in to WordPress admin.
     * @param {string} username Username to log in with.
     * @param {string} password Password to log in with.
     */
    async login( username: string = 'admin', password: string = 'password' ) {
        await this.goto( '/wp-admin' );
        await this.page.fill( '#user_login', username );
        await this.page.fill( '#user_pass', password );
        await this.page.click( '#wp-submit' );
        await expect( this.page ).toHaveURL( /\/wp-admin/ );
    }

    /**
     * Activate a theme.
     * @param {string} themeSlug Theme to activate.
     */
    async activateTheme( themeSlug: string ) {
        await this.goto( '/wp-admin/themes.php' );
        await this.page.click( `[data-slug="${ themeSlug }"] .activate` );
        await expect( this.page.locator( '.notice-success' ) ).toBeVisible();
    }
}

/**
 * Render a pattern and take a screenshot.
 * @param {any}    editor      Editor object.
 * @param {string} patternSlug Slug of the pattern to render.
 */
export const renderPattern = async ( editor: any, patternSlug: string ) => {
    await editor.page
        .getByRole( 'button', { name: 'Options', exact: true } )
        .click();
    await editor.page
        .getByRole( 'menuitemradio', { name: /Code editor/ } )
        .click();
    await editor.page
        .getByRole( 'textbox', { name: 'Type text or HTML' } )
        .fill( `<!-- wp:pattern {"slug":"${ patternSlug }"} /-->` );
    await editor.page
        .getByRole( 'button', { name: 'Exit code editor' } )
        .click();
    const preview = ( await editor.openPreviewPage() )
        .locator( '.entry-content' )
        .first();
    await expect( preview ).toHaveScreenshot();
};

/**
 * Creates a test suite that renders each pattern for visual regression testing.
 *
 * @param {string}   themeSlug Theme slug to use as prefix for patterns.
 * @param {string[]} patterns  Array of pattern names to test.
 */
export const createPatternTests = ( themeSlug: string, patterns: string[] ) => {
    test.describe( 'pattern', () => {
        test.beforeEach( async ( { admin } ) => {
            await admin.createNewPost();
        } );

        for ( const p of patterns ) {
            test( p, async ( { editor } ) => {
                await renderPattern( editor, `${ themeSlug }/${ p }` );
            } );
        }
    } );
};

export { config };
