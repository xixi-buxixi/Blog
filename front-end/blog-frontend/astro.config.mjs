import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

export default defineConfig({
  integrations: [
    react(),
    tailwind()
  ],
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  server: {
    port: 4321
  },
  vite: {
    build: {
      // 代码分割优化
      rollupOptions: {
        output: {
          // 将大型库单独分包
          manualChunks: (id) => {
            if (id.includes('highlight.js')) {
              return 'highlight';
            }
            if (id.includes('marked')) {
              return 'marked';
            }
            if (id.includes('dompurify')) {
              return 'dompurify';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react';
            }
          }
        }
      },
      // 压缩优化
      minify: 'esbuild',
      target: 'es2020'
    },
    ssr: {
      // SSR时不打包这些库，让它们保持external
      noExternal: []
    },
    server: {
      proxy: {
        '/api/v1': {
          target: 'http://localhost:8080',
          changeOrigin: true
        }
      }
    }
  }
});