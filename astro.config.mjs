// @ts-check
import { defineConfig } from 'astro/config';
import path from 'path';

import mdx from '@astrojs/mdx';

import vue from '@astrojs/vue';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  i18n: {
    locales: ['zh-cn', 'en'],
    defaultLocale: 'zh-cn',
    routing: {
      prefixDefaultLocale: true,
    },
  },

  vite: {
    server: {
      hmr: {
        overlay: false,
      },
    },

    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
  },

  integrations: [mdx(), vue()],
  adapter: cloudflare(),
});