import { LinkUtil } from '@coffic/cosy-ui';

export const configApp = {
    homeLink: LinkUtil.getBaseUrl(),
    basePath: LinkUtil.getBaseUrl(),
    getSiteName: (lang: string) => {
        return lang === 'zh-cn' ? 'Coffic MCP' : 'Coffic MCP';
    },
    getSiteDescription: (lang: string) => {
        return lang === 'zh-cn' ? '一个工具库，帮助你构建美好的应用程序' : 'A library of tools for building applications';
    },
    getSiteKeywords: (lang: string) => {
        return lang === 'zh-cn' ? 'Coffic MCP, Astro, component library' : 'Coffic MCP, Astro, component library';
    },
    getSlogan: (lang: string) => {
        return lang === 'zh-cn' ? '一个工具库，帮助你构建美好的应用程序' : 'A library of tools for building applications';
    },
    getNavItems: (lang: string) => [
        {
            href: `${LinkUtil.getBaseUrl()}${lang}`,
            title: 'Home',
        },
        {
            href: `${LinkUtil.getBaseUrl()}${lang}/manuals`,
            title: 'Docs',
        },
        {
            href: `${LinkUtil.getBaseUrl()}${lang}/tools/text2image`,
            title: 'Text2Image',
        }
    ],
};
