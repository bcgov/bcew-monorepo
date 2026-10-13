import { defaultTheme } from '@vuepress/theme-default';

import { defineUserConfig } from 'vuepress';
import { searchPlugin } from '@vuepress/plugin-search';
import { viteBundler } from '@vuepress/bundler-vite';

export default defineUserConfig({
    base: '/bcew-plugin/',
    lang: 'en-US',
    title: 'BC Extended Web Plugin',
    description: 'User and developer documentation for BC Extended Web Plugin',
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
            { text: 'User docs', link: '/user-docs' },
            { text: 'Developer docs', link: '/developer-docs' },
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
