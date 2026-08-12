import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { transform } from 'esbuild';

// Vite's build/test-time import analysis cannot parse JSX inside `.js` files.
// This plugin transpiles JSX (in `.js` only) BEFORE that analysis runs, so the
// project can keep its `.js` files instead of renaming them to `.jsx`.
// (In dev, @vitejs/plugin-react already strips JSX, so this is a no-op there.)
const jsxJsPreTransform = () => ({
  name: 'vite:jsx-js-pre-transform',
  enforce: 'pre',
  async transform(code, id) {
    if (!id.endsWith('.js')) return;
    if (id.includes('/node_modules/')) return;
    // Only touch files that actually contain JSX, to keep dev/HMR overhead at zero.
    if (!/<[A-Za-z][\w.-]*(\s|>|\/|$)/.test(code)) return;
    const result = await transform(code, {
      loader: 'jsx',
      jsx: 'automatic',
      sourcemap: true,
    });
    return { code: result.code, map: result.map };
  },
});

export default defineConfig({
  plugins: [...react(), jsxJsPreTransform()],
  // The dev-server dependency scanner uses esbuild directly and would choke on
  // JSX in `.js` files; scope the jsx loader to that scan only (dev transforms
  // are handled by @vitejs/plugin-react, build/test by the plugin above).
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  envPrefix: ['VITE_', 'REACT_APP_'],
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://localhost:3003', changeOrigin: true },
    },
  },
  build: {
    outDir: 'build',
    cssCodeSplit: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
