// @ts-check
import { defineConfig } from 'astro/config';
import path from 'path';

import mdx from '@astrojs/mdx';

import vue from '@astrojs/vue';

import cloudflare from '@astrojs/cloudflare';

// @ts-ignore
import tailwindcss from '@tailwindcss/vite';

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

    plugins: [tailwindcss()],
  },

  integrations: [mdx(), vue()],
  adapter: cloudflare(),
});