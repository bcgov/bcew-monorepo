import { createPatternTests } from '@bcew-monorepo/e2e';

// Pattern slugs keep the pre-rename prefix (stored data); see docs/renaming-projects.md step 5.
createPatternTests(
    'bcew-hporoo',
    [ 'footer', 'hporoo-base-footer', 'hporoo-hero', 'tribunal-base-footer' ],
    'design-system-wordpress-child-theme-hporoo'
);
