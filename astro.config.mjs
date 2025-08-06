// @ts-check
import { defineConfig } from 'astro/config';
import path from 'path';

// https://astro.build/config
export default defineConfig({
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
});
