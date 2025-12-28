import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/marp-web-editor/' : '/',
  plugins: [
    react(),
    nodePolyfills({
      include: ['path', 'fs', 'url', 'util', 'stream', 'buffer', 'process'],
      globals: {
        process: true,
        Buffer: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'source-map-js': path.resolve(__dirname, 'node_modules/source-map-js/source-map.js'),
    },
  },
  optimizeDeps: {
    include: ['source-map-js'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
