import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Breadcrumb Block', () => {
    const BLOCK_NAME = 'design-system-wordpress-plugin/breadcrumb';

    test.afterEach( async ( { requestUtils } ) => {
        await requestUtils.deleteAllPages();
    } );

    test( 'complete breadcrumb workflow - parent only and full hierarchy on frontend', async ( {
        page,
        requestUtils,
    } ) => {
        const mainContent = page.locator( '#main-content' );

        // --- 1. Parent + Child: breadcrumb shows Parent (link) and Child (current page as text) ---
        const parentPage = await requestUtils.rest( {
            method: 'POST',
            path: '/wp/v2/pages',
            data: {
                title: 'Parent page',
                status: 'publish',
            },
        } );
        const childPage = await requestUtils.rest( {
            method: 'POST',
            path: '/wp/v2/pages',
            data: {
                title: 'Child page',
                status: 'publish',
                parent: parentPage.id,
                content: `<!-- wp:${ BLOCK_NAME } /-->`,
            },
        } );

        await page.goto( `/?page_id=${ childPage.id }` );
        await page.waitForLoadState( 'networkidle' );

        // Breadcrumb shows Parent (link) and current page (Child) in the trail
        const breadcrumb = mainContent.locator(
            '.wp-block-design-system-wordpress-plugin-breadcrumb'
        );
        await expect(
            breadcrumb.getByRole( 'link', { name: 'Parent page', exact: true } )
        ).toHaveCount( 1 );
        await expect(
            breadcrumb.getByText( 'Child page', { exact: true } )
        ).toBeVisible();

        // --- 2. Grandparent → Middle → Leaf: full hierarchy ---
        const grandparentPage = await requestUtils.rest( {
            method: 'POST',
            path: '/wp/v2/pages',
            data: {
                title: 'Grandparent page',
                status: 'publish',
            },
        } );
        const middlePage = await requestUtils.rest( {
            method: 'POST',
            path: '/wp/v2/pages',
            data: {
                title: 'Middle page',
                status: 'publish',
                parent: grandparentPage.id,
            },
        } );
        const leafPage = await requestUtils.rest( {
            method: 'POST',
            path: '/wp/v2/pages',
            data: {
                title: 'Leaf page',
                status: 'publish',
                parent: middlePage.id,
                content: `<!-- wp:${ BLOCK_NAME } /-->`,
            },
        } );

        await page.goto( `/?page_id=${ leafPage.id }` );
        await page.waitForLoadState( 'networkidle' );

        // Breadcrumb: Home > Grandparent > Middle > Leaf (ancestors as links, current page in trail)
        const breadcrumbHierarchy = mainContent.locator(
            '.wp-block-design-system-wordpress-plugin-breadcrumb'
        );
        await expect(
            breadcrumbHierarchy.getByRole( 'link', {
                name: 'Grandparent page',
                exact: true,
            } )
        ).toHaveCount( 1 );
        await expect(
            breadcrumbHierarchy.getByRole( 'link', {
                name: 'Middle page',
                exact: true,
            } )
        ).toHaveCount( 1 );
        await expect(
            breadcrumbHierarchy.getByText( 'Leaf page', { exact: true } )
        ).toBeVisible();
    } );

    test( 'typography settings are applied to frontend', async ( {
        admin,
        editor,
    } ) => {
        await admin.createNewPost( {
            showWelcomeGuide: false,
        } );

        await editor.insertBlock( { name: BLOCK_NAME } );

        await editor.page.getByRole( 'tab', { name: 'Styles' } ).click();
        await editor.page
            .getByRole( 'radio', { name: 'Large', exact: true } )
            .click();

        const preview = await editor.openPreviewPage();

        await expect(
            preview
                .locator(
                    '.wp-block-design-system-wordpress-plugin-breadcrumb'
                )
                .first()
        ).toContainClass( 'has-large-font-size' );
    } );
} );
