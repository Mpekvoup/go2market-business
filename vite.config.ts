import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { contactApiPlugin } from './server/vite-contact.mjs';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command, mode, isSsrBuild }) => ({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: false,
    allowedHosts: [
      'go2market.qa',
      'www.go2market.qa',
      'g2mqatarnew-production.up.railway.app',
      '.railway.app',
      'localhost'
    ]
  },
  plugins: [react(), tailwindcss(), contactApiPlugin(loadEnv(mode, process.cwd(), ''))],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    cssMinify: true,
    minify: 'esbuild',
    rollupOptions: {
      output: isSsrBuild ? {
        // SSR build: no hashes in filenames for easier import
        entryFileNames: '[name].js',
        chunkFileNames: 'assets/js/[name].js',
      } : {
        // Client build: use hashes for cache busting
        manualChunks(id) {
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/')) {
            return 'vendor';
          }
          if (id.includes('/node_modules/react-router')) {
            return 'router';
          }
          if (id.includes('/node_modules/@emailjs')) {
            return 'emailjs';
          }
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.');
          let extType = info?.[info.length - 1] || '';
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(extType)) {
            extType = 'images';
          } else if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
            extType = 'fonts';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
  },
  ssr: {
    noExternal: ['react-router-dom', 'react-router'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
}));
