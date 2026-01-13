import { test } from '@wordpress/e2e-test-utils-playwright';

// These blocks don't display in WP's style-book.
const EXCLUDED_BLOCKS = [
    'column',
    'comment-template',
    'embed',
    'footnotes',
    'list-item',
    'next-page',
    'pagination',
    'post-template',
    'query-total',
    'spacer',
];

/**
 * Converts text to a URL-friendly slug format.
 * @param text - The text to slugify, or null.
 * @returns A lowercase string with spaces and slashes replaced by hyphens.
 */
const slugify = (text: string | null) =>
    (text ?? 'unknown').trim().replace(/[ /]/g, '-').toLowerCase();



/**
 * Test suite for WordPress style book block screenshots.
 */
test.describe('style book', () => {
    /**
     * Captures screenshots of all blocks in the WordPress style book.
     * Iterates through each block in the styles list, excluding blocks defined in EXCLUDED_BLOCKS,
     * and saves a screenshot of each block's preview to the snapshots directory.
     */
    test('all blocks', async ({ admin }) => {
        // Navigate to the site editor with the style book preview enabled
        await admin.visitAdminPage(
            'site-editor.php',
            'p=%2Fstyles&preview=stylebook&section=%2Fblocks'
        );

        // Get the styles list region and count the number of blocks
        const stylesList = admin.page.getByRole('region', { name: 'Styles' });
        const count = await stylesList.getByRole('listitem').count();
        // Get the preview frame that displays the style book canvas
        const previewFrame = admin.page
            .locator('iframe[name="style-book-canvas"]')
            .contentFrame();

        // Iterate through each block in the styles list
        for (let i = 0; i < count; i++) {
            const blockItem = stylesList.getByRole('listitem').nth(i);
            const name = slugify(await blockItem.textContent());

            // Skip blocks that are in the exclusion list
            if (EXCLUDED_BLOCKS.includes(name)) {
                continue;
            }

            // Click on the block to display it in the preview
            await blockItem.click();
            // Capture a screenshot of the block's preview
            await previewFrame.getByRole('gridcell').first().screenshot({
                animations: 'disabled',
                path: `tests/screenshot/__snapshots__/style-book-${name}.png`,
            });
            // Navigate back to the styles list
            await admin.page.getByRole('button', { name: 'Back', exact: true }).click();
        }
    });
});
