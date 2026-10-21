import { createPatternTests } from '@bcew-monorepo/e2e';

// Pattern slugs keep the pre-rename prefix (stored data); see docs/renaming-projects.md step 4.
createPatternTests(
    'bcew-firb',
    [
        'firb-bullet-list',
        'firb-call-to-action-short',
        'firb-columns-with-headings-h2-h3',
        'firb-columns-with-headings-h3-h4',
        'firb-icon-with-excerpt-single',
        'firb-paragraph',
        'firb-subheading-h3-h4-with-paragraphs',
        'hero-banner',
        'site-logo',
        'base-header',
        'base-footer',
        'page-404',
    ],
    'design-system-wordpress-child-theme-firb'
);
