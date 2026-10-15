import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vitepress';

type SidebarItem = {
  text: string;
  link?: string;
  collapsed?: boolean;
  items?: SidebarItem[];
};

type Section = {
  text: string;
  items: SidebarItem[];
};

const repoRoot = resolve(__dirname, '..', '..');

const packageDisplayNames: Record<string, string> = {
  'bcew-theme': 'BC Extended Web Theme',
  'bcew-plugin': 'BCEW Plugin',
  'bcew-belleville-terminal': 'BCEW Belleville Terminal',
  'bcew-blocks': 'BCEW Blocks',
  'bcew-chefs-embed': 'BCEW CHEFS Embed',
  'bcew-document-repository': 'BCEW Document Repository',
  'wordpress-search': 'BCEW Search',
  'bcew-theme-2': 'BCEW Theme 2',
  'bcew-ticorp': 'BCEW TI Corp'
};

/** Returns the configured display name, or title-cases the package slug. */
function getPackageDisplayName(name: string): string {
  if (packageDisplayNames[name]) {
    return packageDisplayNames[name];
  }
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Formats a markdown filename or folder name for display in the sidebar. */
function formatDocTitle(key: string): string {
  return key
    .replace(/^DSWP/, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/** Builds sidebar links for the markdown pages and folders beneath an audience. */
function buildSidebarForDir(dirPath: string, urlPrefix: string): SidebarItem[] {
  if (!existsSync(dirPath)) {
    return [];
  }

  // Keep topic navigation stable and alphabetical.
  const entries = readdirSync(dirPath, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const items: SidebarItem[] = [];

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const slug = entry.name.replace(/\.md$/, '');
      if (slug === 'index' || slug === 'README') {
        continue;
      }

      const content = readFileSync(resolve(dirPath, entry.name), 'utf8');
      const title = content.match(/^#\s+(.+)$/m)?.[1] ?? formatDocTitle(slug);
      items.push({ text: title, link: `${urlPrefix}/${slug}` });
    } else if (
      entry.isDirectory() &&
      entry.name !== 'images' &&
      entry.name !== 'public' &&
      !entry.name.startsWith('.')
    ) {
      if (entry.name === 'guide') {
        const guideItems = buildSidebarForDir(
          resolve(dirPath, 'guide'),
          `${urlPrefix}/guide`
        );
        items.push(...guideItems);
      } else {
        const subDirPath = resolve(dirPath, entry.name);
        const subItems = buildSidebarForDir(
          subDirPath,
          `${urlPrefix}/${entry.name}`
        );
        const indexPath = resolve(subDirPath, 'index.md');
        if (subItems.length > 0 || existsSync(indexPath)) {
          items.push({
            text: formatDocTitle(entry.name),
            ...(existsSync(indexPath)
              ? { link: `${urlPrefix}/${entry.name}/` }
              : {}),
            ...(subItems.length > 0
              ? { collapsed: true, items: subItems }
              : {})
          });
        }
      }
    }
  }

  return items;
}

/** Builds a package sidebar with user topics at top level and grouped developer topics. */
function packageDocsSection(
  dirName: 'plugins' | 'themes',
  sectionTitle: string
): Section {
  const baseDir = resolve(repoRoot, dirName);
  const entries = readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  // Build one sidebar item for each package that has an index page.
  const items = entries.flatMap((name) => {
    const docsIndex = resolve(baseDir, name, 'docs', 'index.md');
    if (!existsSync(docsIndex)) {
      return [];
    }

    const docsDir = resolve(baseDir, name, 'docs');
    const link = `/content/${dirName}/${name}/`;
    const sidebarItems: SidebarItem[] = [];

    if (existsSync(resolve(docsDir, 'user-docs.md'))) {
      // Put user-facing topics directly under the package.
      sidebarItems.push(
        ...buildSidebarForDir(resolve(docsDir, 'user'), `${link}user`)
      );
    }

    if (existsSync(resolve(docsDir, 'developer-docs.md'))) {
      // Keep developer-facing topics grouped under their audience label.
      sidebarItems.push({
        text: 'Developer Docs',
        link: `${link}developer-docs`,
        collapsed: true,
        items: buildSidebarForDir(
          resolve(docsDir, 'developer'),
          `${link}developer`
        )
      });
    }

    return [
      sidebarItems.length > 0
        ? {
            text: getPackageDisplayName(name),
            link,
            collapsed: true,
            items: sidebarItems
          }
        : { text: getPackageDisplayName(name), link }
    ];
  });

  return {
    text: sectionTitle,
    collapsed: true,
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
  markdown: {
    /** Installs the custom Mermaid fence renderer while preserving others. */
    config(md) {
      const defaultFence = md.renderer.rules.fence;

      // Render Mermaid fences as the site's MermaidDiagram component.
      md.renderer.rules.fence = (tokens, index, options, env, self) => {
        const token = tokens[index];

        if (token.info.trim() === 'mermaid') {
          return `<MermaidDiagram code="${md.utils.escapeHtml(token.content)}" />`;
        }

        return defaultFence
          ? defaultFence(tokens, index, options, env, self)
          : self.renderToken(tokens, index, options);
      };
    }
  },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guides', link: '/getting-started' },
      { text: 'Contributing docs', link: '/contributing' }
    ],
    sidebar: [
      {
        text: 'Monorepo Guides',
        collapsed: true,
        items: monorepoGuideItems
      },
      packageDocsSection('plugins', 'Plugins Guides'),
      packageDocsSection('themes', 'Themes Guides')
    ],
    search: {
      provider: 'local'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/bcgov/bcew-monorepo' }
    ]
  }
});
