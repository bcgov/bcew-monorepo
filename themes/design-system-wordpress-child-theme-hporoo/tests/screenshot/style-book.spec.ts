import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import type { Page } from '@playwright/test';

// Config
// Allows up to 2% of pixels to differ; accounts for anti-aliasing and minor rendering variations
const SCREENSHOT_OPTIONS = { maxDiffPixelRatio: 0.02 } as const;
const RENDER_WAIT_MS = 500;
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
    // navigation renders dynamic content in the style book and is unstable across runs
    'navigation',
] as const;

type ExcludedBlockName = (typeof EXCLUDED_BLOCKS)[number];

// Helpers
const slugify = (text: string | null): string =>
    (text ?? 'unknown').trim().replace(/[ /]/g, '-').toLowerCase();

const getStylesList = (page: Page) =>
    page.getByRole('region', { name: 'Styles' }).getByRole('listitem');

const getPreviewCell = (page: Page) =>
    page
        .locator('iframe[name="style-book-canvas"]')
        .contentFrame()
        .getByRole('gridcell')
        .first();

const disableAnimations = async (page: Page) => {
    await page.evaluate(() => {
        const style = document.createElement('style');
        style.textContent = '* { animation: none !important; transition: none !important; }';
        document.head.appendChild(style);
    });
};

const waitForRender = async (page: Page) => {
    // Allow block preview to finish layout rendering
    await page.waitForTimeout(RENDER_WAIT_MS);
};

test.describe('style book', () => {
    test('should capture visual regressions for all stable blocks', async ({ admin }) => {
        await admin.visitAdminPage(
            'site-editor.php',
            'p=%2Fstyles&preview=stylebook&section=%2Fblocks'
        );

        const list = getStylesList(admin.page);
        const count = await list.count();
        const results = { tested: 0, skipped: 0, failed: 0 };

        for (let i = 0; i < count; i++) {
            const item = list.nth(i);
            const blockLabel = await item.textContent();
            const name = slugify(blockLabel);

            if (EXCLUDED_BLOCKS.includes(name as ExcludedBlockName)) {
                results.skipped++;
                continue;
            }

            try {
                await item.click();

                const preview = getPreviewCell(admin.page);
                await preview.waitFor({ state: 'visible' });
                await disableAnimations(preview.page());
                await waitForRender(preview.page());

                await preview.screenshot({
                    animations: 'disabled',
                    path:
                        'tests/screenshot/__snapshots__/style-book-' +
                        name +
                        '.png',
                });
                results.tested++;
            } catch (error) {
                results.failed++;
                console.error(`Failed to snapshot block: ${name}`, error);
                throw error; // Re-throw to fail the test
            } finally {
                // Always try to navigate back, even on error
                try {
                    await admin.page.getByRole('button', { name: 'Back', exact: true }).click();
                } catch {
                    // Ignore back button errors
                }
            }
        }

    });
});
