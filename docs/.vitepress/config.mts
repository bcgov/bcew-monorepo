import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vitepress';

type Section = {
  text: string;
  items: Array<{
    text: string;
    link?: string;
    collapsed?: boolean;
    items?: Array<{ text: string; link: string }>;
  }>;
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

  const items = entries.flatMap((name) => {
      const docsIndex = resolve(baseDir, name, 'docs', 'index.md');
      if (!existsSync(docsIndex)) {
        return [];
      }

      const docsDir = resolve(baseDir, name, 'docs');
      const nestedItems: Array<{ text: string; link: string }> = [];

      if (existsSync(resolve(docsDir, 'user-docs.md'))) {
        nestedItems.push({
          text: 'User Docs',
          link: `/content/${dirName}/${name}/user-docs`
        });
      }

      if (existsSync(resolve(docsDir, 'developer-docs.md'))) {
        nestedItems.push({
          text: 'Developer Docs',
          link: `/content/${dirName}/${name}/developer-docs`
        });
      }

      return [
        nestedItems.length > 0
          ? {
              text: name,
              link: `/content/${dirName}/${name}/`,
              collapsed: false,
              items: nestedItems
            }
          : { text: name, link: `/content/${dirName}/${name}/` }
      ];
  });

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
  { text: 'Renaming plugins and themes', link: '/renaming-projects' },
  { text: 'Shared tooling', link: '/shared-tooling' },
  { text: 'CI/CD', link: '/ci-cd' },
  { text: 'Release & deployment', link: '/release-and-deployment' },
  { text: 'Versioning', link: '/versioning' },
  { text: 'Package management', link: '/package-management' },
  { text: 'Dependabot maintenance', link: '/dependabot-maintenance' },
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
