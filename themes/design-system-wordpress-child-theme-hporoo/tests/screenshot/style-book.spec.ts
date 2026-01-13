import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import type { Page } from '@playwright/test';

// Config
const SCREENSHOT_OPTIONS = { maxDiffPixelRatio: 0.02 } as const;
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
    // simple debounce to allow block preview to finish layout
    await page.evaluate(
        () => new Promise((resolve) => setTimeout(resolve, 500))
    );
};

test.describe('style book', () => {
    test('all blocks', async ({ admin }) => {
        await admin.visitAdminPage(
            'site-editor.php',
            'p=%2Fstyles&preview=stylebook&section=%2Fblocks'
        );

        const list = getStylesList(admin.page);
        const count = await list.count();

        for (let i = 0; i < count; i++) {
            const item = list.nth(i);
            const name = slugify(await item.textContent());
            if (EXCLUDED_BLOCKS.includes(name as any)) continue;

            await item.click();

            const preview = getPreviewCell(admin.page);
            await preview.waitFor({ state: 'visible' });
            await disableAnimations(preview.page());
            await waitForRender(preview.page());

            await expect(preview).toHaveScreenshot(`style-book-${name}.png`, SCREENSHOT_OPTIONS);

            await admin.page.getByRole('button', { name: 'Back', exact: true }).click();
        }
    });
});
