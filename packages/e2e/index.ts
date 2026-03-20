/**
 * Shared Playwright test utilities for the WordPress monorepo.
 *
 * Common helpers for e2e tests across themes and plugins.
 */

import { expect, Page } from '@playwright/test';
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

export { config };
