import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vitepress';

type Section = {
  text: string;
  items: Array<{ text: string; link: string }>;
};

const repoRoot = resolve(__dirname, '..', '..');

function packageDocsSection(
  dirName: 'plugins' | 'themes',
  sectionTitle: string
): Section {
  const baseDir = resolve(repoRoot, dirName);
  const entries = readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const items = entries
    .map((name) => {
      const docsIndex = resolve(baseDir, name, 'docs', 'index.md');
      if (!existsSync(docsIndex)) {
        return null;
      }

      return { text: name, link: `/content/${dirName}/${name}/` };
    })
    .filter((item): item is { text: string; link: string } => item !== null);

  return {
    text: sectionTitle,
    items:
      items.length > 0
        ? items
        : [
            {
              text: `No ${dirName} docs yet`,
              link: '/contributing'
            }
          ]
  };
}

const monorepoGuideItems = [
  { text: 'Overview', link: '/' },
  { text: 'Getting started', link: '/getting-started' },
  { text: 'Documentation site', link: '/documentation-site' },
  { text: 'Architecture', link: '/architecture' },
  { text: 'Project standards', link: '/project-standards' },
  { text: 'Contributing & migration', link: '/contributing-workflow' },
  { text: 'Shared tooling', link: '/shared-tooling' },
  { text: 'CI/CD', link: '/ci-cd' },
  { text: 'Release & deployment', link: '/release-and-deployment' },
  { text: 'Versioning', link: '/versioning' },
  { text: 'Package management', link: '/package-management' },
  { text: 'Contributing docs', link: '/contributing' },
  { text: 'Onboarding checklist', link: '/onboarding-validation' },
  { text: 'Maintenance', link: '/maintenance' },
  { text: 'Code Ownership', link: '/code-owners' }
];

export default defineConfig({
  base: process.env.DOCS_BASE ?? '/',
  title: 'BCEW Monorepo Docs',
  description: 'Shared docs for themes, plugins, and monorepo workflows',
  srcExclude: ['**/README.md'],
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guides', link: '/getting-started' },
      { text: 'Contributing docs', link: '/contributing' }
    ],
    sidebar: [
      {
        text: 'Monorepo',
        items: monorepoGuideItems
      },
      packageDocsSection('plugins', 'Plugins'),
      packageDocsSection('themes', 'Themes')
    ],
    search: {
      provider: 'local'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/bcgov/bcew-monorepo' }
    ]
  }
});
