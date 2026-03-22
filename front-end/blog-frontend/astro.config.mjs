import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [
    react(),
    tailwind()
  ],
  server: {
    port: 4321
  },
  output: 'static',
  vite: {
    ssr: {
      noExternal: ['highlight.js']
    },
    server: {
      proxy: {
        '/api/v1': {
          target: 'http://localhost:8080',
          // changeOrigin: true
        }
      }
    }
  }
});