import { defaultTheme } from '@vuepress/theme-default';

import { defineUserConfig } from 'vuepress';
import { searchPlugin } from '@vuepress/plugin-search';
import { viteBundler } from '@vuepress/bundler-vite';

export default defineUserConfig({
    base: '/bcew-plugin/',
    lang: 'en-US',
    title: 'BC Extended Web Plugin',
    description: 'Developer Documentation for BC Extended Web Plugin',
    bundler: viteBundler({}),
    theme: defaultTheme({
        logo: '/images/BCID_H_rgb_pos.png',
        logoDark: '/images/BCID_H_rgb_rev.png',
        editLink: false,
        lastUpdated: false,
        repo: 'bcgov/bcew-monorepo',
        repoLabel: 'GitHub',
        sidebarDepth: 2,
        navbar: [
            {
                text: 'Home',
                link: '/',
            },
        ],
        sidebar: [
            {
                text: 'Site Editor',
                collapsible: true,
                children: [
                    { text: 'CSP', link: '/guide/SiteEditor/CSP' },
                    {
                        text: 'Notification Banner',
                        link: '/guide/SiteEditor/NotificationBanner',
                    },
                    {
                        text: 'In Page Navigation',
                        link: '/guide/SiteEditor/InPageNavigation',
                    },
                    {
                        text: 'Navigation Block',
                        link: '/guide/SiteEditor/NavigationBlock',
                    },
                    {
                        text: 'Auto Anchor',
                        link: '/guide/SiteEditor/AutoAnchor',
                    },
                    {
                        text: 'BreadCrumb Block',
                        link: '/guide/SiteEditor/BreadCrumbBlock',
                    },
                ],
            },
            {
                text: 'Developers',
                collapsible: true,
                children: [],
            },
        ],
    }),
    plugins: [
        searchPlugin({
            locales: {
                '/': {
                    placeholder: 'Search...',
                },
            },
        }),
    ],
});
