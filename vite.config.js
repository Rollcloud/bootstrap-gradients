import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: path.resolve(__dirname, 'src'),
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        silenceDeprecations: ['import', 'color-functions', 'global-builtin'],
        verbose: false,
      },
    },
  },
  server: {
    port: 5174,
  },
});
