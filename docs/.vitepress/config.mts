import { existsSync, readdirSync } from 'node:fs';
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
  'design-system-wordpress-theme': 'Design System WordPress Theme',
  'bcew-belleville-terminal': 'BCEW Belleville Terminal',
  'bcew-blocks': 'BCEW Blocks',
  'bcew-chefs-embed': 'BCEW CHEFS Embed',
  'bcew-document-repository': 'BCEW Document Repository',
  'bcew-theme-2': 'BCEW Theme 2',
  'bcew-ticorp': 'BCEW TI Corp'
};

const docTitleOverrides: Record<string, string> = {
  SiteEditor: 'Site Editor',
  Developers: 'Developers',
  Patterns: 'Patterns',
  HowToUsePatterns: 'How to Use Patterns',
  PatternsOverview: 'Patterns Overview',
  DSWPCardWithHyperLinkList: 'Card with Hyperlink List',
  DSWPDefaultHeading: 'Default Heading',
  DSWPFooterWithTerritorialAcknowledgement: 'Footer with Territorial Acknowledgement',
  DSWPHeadingWithParagraphs: 'Heading with Paragraphs',
  DSWPHeroImageWithTitle: 'Hero Image with Title',
  DSWPHorizontalCard: 'Horizontal Card',
  DSWPHorizontalCardLargeImageLeft: 'Horizontal Card Large Image Left',
  DSWPHorizontalCardLargeImageRight: 'Horizontal Card Large Image Right',
  DSWPHorizontalCardNoShadow: 'Horizontal Card No Shadow',
  DSWPIconWithExcerpt: 'Icon with Excerpt',
  DSWPImageAndText: 'Image & Text',
  DSWPImageAndTextFlipped: 'Image & Text Flipped',
  DSWPInformationContactSocials: 'Information Contact Socials',
  DSWPLinkWithArrow: 'Link with Arrow',
  DSWPSecondaryHeroImageWithTitle: 'Secondary Hero Image with Title',
  DSWPTeamPattern: 'Team Pattern',
  DSWPVerticalCards: 'Vertical Cards',
  DSWPVerticalCardsWithIcon: 'Vertical Cards with Icon',
  PatternsTroubleShooting: 'Patterns Troubleshooting',
  TemplateParts: 'Template Parts',
  'user-docs': 'User Docs',
  'developer-docs': 'Developer Docs',
  'metadata-settings': 'Metadata Settings',
  'bcew-document-repository-feature': 'Feature Overview',
  icon: 'Icon',
  'media-text-layout': 'Media & Text Layout',
  overview: 'Overview'
};

const itemPriority: Record<string, number> = {
  'Site Editor': 1,
  'How to Use Patterns': 2,
  'Patterns Overview': 3,
  'Developers': 100
};

function getPackageDisplayName(name: string): string {
  if (packageDisplayNames[name]) {
    return packageDisplayNames[name];
  }
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatDocTitle(key: string): string {
  if (docTitleOverrides[key]) {
    return docTitleOverrides[key];
  }
  return key
    .replace(/^DSWP/, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function buildSidebarForDir(dirPath: string, urlPrefix: string): SidebarItem[] {
  if (!existsSync(dirPath)) {
    return [];
  }

  const entries = readdirSync(dirPath, { withFileTypes: true });
  const items: SidebarItem[] = [];

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const slug = entry.name.replace(/\.md$/, '');
      if (slug === 'index' || slug === 'overview' || slug === 'README') {
        continue;
      }
      items.push({
        text: formatDocTitle(slug),
        link: `${urlPrefix}/${slug}`
      });
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
        const subItems = buildSidebarForDir(
          resolve(dirPath, entry.name),
          `${urlPrefix}/${entry.name}`
        );
        if (subItems.length > 0) {
          items.push({
            text: formatDocTitle(entry.name),
            collapsed: true,
            items: subItems
          });
        }
      }
    }
  }

  items.sort((a, b) => {
    const priorityA = itemPriority[a.text] ?? 50;
    const priorityB = itemPriority[b.text] ?? 50;
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    return a.text.localeCompare(b.text);
  });

  return items;
}

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
    const displayName = getPackageDisplayName(name);
    const nestedItems = buildSidebarForDir(
      docsDir,
      `/content/${dirName}/${name}`
    );

    const pluginNestedItems = [...nestedItems];
    const hasDevelopersSection = name === 'design-system-wordpress-plugin' && !pluginNestedItems.some((item) => item.text === 'Developers');
    if (hasDevelopersSection) {
      pluginNestedItems.push({
        text: 'Developers',
        collapsed: true,
        items: []
      });
    }

    return [
      nestedItems.length > 0 || hasDevelopersSection
        ? {
            text: displayName,
            link: `/content/${dirName}/${name}/`,
            collapsed: false,
            items: pluginNestedItems
          }
        : { text: displayName, link: `/content/${dirName}/${name}/` }
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
