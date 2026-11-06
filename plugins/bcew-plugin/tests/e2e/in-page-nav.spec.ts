import { test, expect, Editor } from '@wordpress/e2e-test-utils-playwright';
import { Page } from '@playwright/test';
import { closeChoosePatternModal } from './helpers';

/**
 * @todo Future tests: mobile functionality.
 */
test.describe( 'InPageNav', () => {
    /**
     * @todo Fix: The "enable in-page nav" toggle appears on non-page post types but when enabled
     * on them doesn't appear on the frontend. It should probably not be an option in the editor
     * in these cases.
     */
    test.describe( 'Visibility', () => {
        test( 'should not appear when enabled without h2s', async ( {
            admin,
            editor,
        } ) => {
            await admin.createNewPost( {
                showWelcomeGuide: false,
            } );
            await editor.setContent( `
                <!-- wp:heading {"level":3} -->
                <h3 class="wp-block-heading">Heading</h3>
                <!-- /wp:heading -->
            ` );
            await closeChoosePatternModal( editor );
            const preview = await getPreviewPage( editor );
            await expect(
                preview.getByRole( 'navigation', { name: 'On this page' } )
            ).toHaveCount( 0 );
        } );

        test( 'should not appear on a non-page post type', async ( {
            admin,
            editor,
        } ) => {
            await admin.createNewPost( {
                showWelcomeGuide: false,
            } );
            await editor.setContent( `
                <!-- wp:heading -->
                <h2 class="wp-block-heading">Heading</h2>
                <!-- /wp:heading -->
            ` );
            await closeChoosePatternModal( editor );
            const preview = await getPreviewPage( editor );
            await expect(
                preview.getByRole( 'navigation', { name: 'On this page' } )
            ).toHaveCount( 0 );
        } );

        test( 'should not appear when option is not enabled', async ( {
            admin,
            editor,
        } ) => {
            await admin.createNewPost( {
                showWelcomeGuide: false,
            } );
            await editor.setContent( `
                <!-- wp:heading -->
                <h2 class="wp-block-heading">Heading</h2>
                <!-- /wp:heading -->
            ` );
            await closeChoosePatternModal( editor );
            const preview = await editor.openPreviewPage();
            await expect(
                preview.getByRole( 'navigation', { name: 'On this page' } )
            ).toHaveCount( 0 );
        } );
    } );

    test.describe( 'Functionality', () => {
        test.beforeEach( async ( { admin } ) => {
            // Create a new post before each test
            await admin.createNewPost( {
                postType: 'page',
                title: 'Test page',
                showWelcomeGuide: false,
            } );
        } );

        test( 'should create links for h2s and scroll to them when clicked, keyboard', async ( {
            editor,
        } ) => {
            await editor.setContent( `
                <!-- wp:heading -->
                <h2 class="wp-block-heading">Heading 1</h2>
                <!-- /wp:heading -->

                <!-- wp:heading -->
                <h2 class="wp-block-heading">Heading 2</h2>
                <!-- /wp:heading -->

                <!-- wp:heading {"level":1} -->
                <h1 class="wp-block-heading">H1</h1>
                <!-- /wp:heading -->

                <!-- wp:heading {"level":3} -->
                <h3 class="wp-block-heading">H3</h3>
                <!-- /wp:heading -->

                <!-- wp:heading {"level":4} -->
                <h4 class="wp-block-heading">H4</h4>
                <!-- /wp:heading -->

                <!-- wp:heading {"level":5} -->
                <h5 class="wp-block-heading">H5</h5>
                <!-- /wp:heading -->

                <!-- wp:heading {"level":6} -->
                <h6 class="wp-block-heading">H6</h6>
                <!-- /wp:heading -->

                <!-- wp:heading -->
                <h2 class="wp-block-heading">Heading 3</h2>
                <!-- /wp:heading -->
            ` );
            await closeChoosePatternModal( editor );
            const preview = await getPreviewPage( editor );

            // Link visibility.
            await expect(
                preview.getByRole( 'navigation', { name: 'On this page' } )
            ).toHaveCount( 1 );
            await expect(
                preview.getByRole( 'link', { name: 'Heading 1' } )
            ).toBeVisible();
            await expect(
                preview.getByRole( 'link', { name: 'Heading 2' } )
            ).toBeVisible();
            await expect(
                preview.getByRole( 'link', { name: 'Heading 3' } )
            ).toBeVisible();

            // Click navigation.
            await preview.getByRole( 'link', { name: 'Heading 1' } ).click();
            await expect( preview.url() ).toContain( '#section-heading-1-0' );

            await preview.getByRole( 'link', { name: 'Heading 2' } ).click();
            await expect( preview.url() ).toContain( '#section-heading-2-1' );

            await preview.getByRole( 'link', { name: 'Heading 3' } ).click();
            await expect( preview.url() ).toContain( '#section-heading-3-2' );

            // Keyboard navigation.
            await preview
                .getByRole( 'heading', { name: 'On this page:' } )
                .click();
            await preview.keyboard.press( 'Tab' );
            await preview.keyboard.press( 'Enter' );
            await expect( preview.url() ).toContain( '#section-heading-1-0' );

            await preview.keyboard.press( 'Tab' );
            await preview.keyboard.press( 'Enter' );
            await expect( preview.url() ).toContain( '#section-heading-2-1' );

            await preview.keyboard.press( 'Tab' );
            await preview.keyboard.press( 'Enter' );
            await expect( preview.url() ).toContain( '#section-heading-3-2' );
        } );

        test( 'should prevent duplicate ids with same heading names', async ( {
            editor,
        } ) => {
            await editor.setContent( `
                <!-- wp:heading -->
                <h2 class="wp-block-heading">Duplicate Heading</h2>
                <!-- /wp:heading -->

                <!-- wp:heading -->
                <h2 class="wp-block-heading">Duplicate Heading</h2>
                <!-- /wp:heading -->

                <!-- wp:heading -->
                <h2 class="wp-block-heading">Duplicate Heading</h2>
                <!-- /wp:heading -->

                <!-- wp:heading -->
                <h2 class="wp-block-heading">Duplicate Heading</h2>
                <!-- /wp:heading -->
            ` );
            await closeChoosePatternModal( editor );
            const preview = await getPreviewPage( editor );

            await expect(
                preview.locator( '#section-duplicate-heading-0' )
            ).toHaveCount( 1 );
            await expect(
                preview.locator( '#section-duplicate-heading-1' )
            ).toHaveCount( 1 );
            await expect(
                preview.locator( '#section-duplicate-heading-2' )
            ).toHaveCount( 1 );
            await expect(
                preview.locator( '#section-duplicate-heading-3' )
            ).toHaveCount( 1 );
        } );

        test( 'should not overwrite existing ids', async ( { editor } ) => {
            await editor.setContent( `
                <!-- wp:heading -->
                <h2 class="wp-block-heading">Heading 1</h2>
                <!-- /wp:heading -->

                <!-- wp:heading -->
                <h2 class="wp-block-heading" id="existing-id">Heading 2</h2>
                <!-- /wp:heading -->
            ` );
            await closeChoosePatternModal( editor );
            const preview = await getPreviewPage( editor );

            await expect(
                preview.getByRole( 'heading', { name: 'Heading 1' } )
            ).toHaveId( 'section-heading-1-0' );
            await expect(
                preview.getByRole( 'heading', { name: 'Heading 2' } )
            ).toHaveId( 'existing-id' );
        } );

        /**
         * @todo Fix special character handling so that, for example é -> e in the id.
         */
        test( 'should replace special characters in ids', async ( {
            editor,
        } ) => {
            await editor.setContent( `
                <!-- wp:heading -->
                <h2 class="wp-block-heading">Québec & Māori – Intro/Overview</h2>
                <!-- /wp:heading -->
            ` );
            await closeChoosePatternModal( editor );
            const preview = await getPreviewPage( editor );

            await expect(
                preview.getByRole( 'heading', {
                    name: 'Québec & Māori – Intro/',
                } )
            ).toHaveId( 'section-qu-bec-m-ori-intro-overview-0' );
        } );
    } );

    /**
     * Regression tests for DSWP-1026: the page intro must not be repeated in
     * the "On this page" navigation box.
     */
    test.describe( 'Intro duplication (DSWP-1026)', () => {
        const intro =
            'This is the page introduction. It is long enough to be treated as an excerpt.';
        const paragraph = ( text: string ) => `
            <!-- wp:paragraph -->
            <p>${ text }</p>
            <!-- /wp:paragraph -->`;
        const heading = ( text: string ) => `
            <!-- wp:heading -->
            <h2 class="wp-block-heading">${ text }</h2>
            <!-- /wp:heading -->`;
        const filler = Array.from( { length: 12 }, ( _, i ) =>
            paragraph(
                `Filler paragraph ${ i + 1 }. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.`
            )
        ).join( '' );

        test.beforeEach( async ( { admin } ) => {
            await admin.createNewPost( {
                postType: 'page',
                title: 'Intro test page',
                showWelcomeGuide: false,
            } );
        } );

        test( 'should show the intro once in the body and list only h2 links in the nav', async ( {
            editor,
        } ) => {
            await editor.setContent(
                paragraph( intro ) +
                    heading( 'First Section' ) +
                    filler +
                    heading( 'Second Section' ) +
                    filler
            );
            await closeChoosePatternModal( editor );
            const preview = await getPreviewPage( editor );

            const nav = preview.getByRole( 'navigation', {
                name: 'On this page',
            } );
            await expect( nav ).toHaveCount( 1 );
            await expect( nav ).not.toContainText( intro );
            await expect( nav.getByRole( 'link' ) ).toHaveCount( 2 );
            await expect(
                preview.getByText( intro, { exact: true } )
            ).toHaveCount( 1 );
        } );

        test( 'should scroll to each section when its nav link is clicked', async ( {
            editor,
        } ) => {
            await editor.setContent(
                paragraph( intro ) +
                    heading( 'First Section' ) +
                    filler +
                    heading( 'Second Section' ) +
                    filler
            );
            await closeChoosePatternModal( editor );
            const preview = await getPreviewPage( editor );
            const nav = preview.getByRole( 'navigation', {
                name: 'On this page',
            } );

            await nav.getByRole( 'link', { name: 'First Section' } ).click();
            await expect(
                preview.getByRole( 'heading', {
                    name: 'First Section',
                    exact: true,
                } )
            ).toBeInViewport();

            await nav.getByRole( 'link', { name: 'Second Section' } ).click();
            await expect(
                preview.getByRole( 'heading', {
                    name: 'Second Section',
                    exact: true,
                } )
            ).toBeInViewport();
        } );

        test( 'should toggle the nav on a narrow viewport', async ( {
            editor,
        } ) => {
            await editor.setContent(
                paragraph( intro ) +
                    heading( 'First Section' ) +
                    filler +
                    heading( 'Second Section' ) +
                    filler
            );
            await closeChoosePatternModal( editor );
            const preview = await getPreviewPage( editor );
            await preview.setViewportSize( { width: 375, height: 812 } );
            await preview.reload();
            await preview.waitForLoadState( 'networkidle' );

            const nav = preview.getByRole( 'navigation', {
                name: 'On this page',
            } );
            const toggle = nav.getByRole( 'button', {
                name: 'Toggle section navigation',
            } );

            // The toggle is hidden at the top of the page.
            await expect( toggle ).toBeHidden();

            // Scrolling reveals the toggle and collapses the nav.
            await preview.mouse.wheel( 0, 600 );
            await expect.poll( () => preview.evaluate( () => window.scrollY ) ).toBeGreaterThan( 50 );
            await expect( toggle ).toBeVisible();
            await expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );
            await expect( nav ).not.toHaveClass( /is-expanded/ );

            await toggle.click();
            await expect( toggle ).toHaveAttribute( 'aria-expanded', 'true' );
            await expect( nav ).toHaveClass( /is-expanded/ );

            await toggle.click();
            await expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );
            await expect( nav ).not.toHaveClass( /is-expanded/ );
        } );
    } );

    /**
     * Perform the necessary actions to enable the InPageNav and open the
     * preview page.
     *
     * @param {Editor} editor - The WordPress editor instance.
     * @return {Promise<Page>} A promise that resolves to the preview page.
     */
    const getPreviewPage = async ( editor: Editor ): Promise< Page > => {
        await editor.openDocumentSettingsSidebar();
        let enableCheckbox = await editor.page.getByRole( 'checkbox', {
            name: 'Enable in-page navigation',
        } );
        const checkboxIsVisible = await enableCheckbox.isVisible();
        if ( ! checkboxIsVisible ) {
            await editor.page
                .getByRole( 'button', { name: 'In-page Navigation' } )
                .click();
            enableCheckbox = await editor.page.getByRole( 'checkbox', {
                name: 'Enable in-page navigation',
            } );
        }
        await enableCheckbox.check();
        return await editor.openPreviewPage();
    };
} );
