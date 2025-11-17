/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    // Plugin to copy extension files after build
    {
      name: 'copy-extension-files',
      closeBundle() {
        if (process.env.BUILD_EXTENSION === 'true') {
          const distDir = resolve(__dirname, 'chrome-extension/dist');
          if (!existsSync(distDir)) {
            mkdirSync(distDir, { recursive: true });
          }
          
          // Copy manifest.json
          copyFileSync(
            resolve(__dirname, 'chrome-extension/manifest.json'),
            resolve(distDir, 'manifest.json')
          );
          
          // Copy popup.html
          copyFileSync(
            resolve(__dirname, 'chrome-extension/popup.html'),
            resolve(distDir, 'popup.html')
          );
          
          // Copy icons if they exist (create placeholder if not)
          const iconSizes = [16, 48, 128];
          iconSizes.forEach(size => {
            const iconPath = resolve(__dirname, `chrome-extension/icon${size}.png`);
            if (existsSync(iconPath)) {
              copyFileSync(iconPath, resolve(distDir, `icon${size}.png`));
            }
          });
        }
      }
    }
  ],
  build: {
    outDir: process.env.BUILD_EXTENSION === 'true' ? 'chrome-extension/dist' : 'dist',
    rollupOptions: process.env.BUILD_EXTENSION === 'true' ? {
      input: {
        content: resolve(__dirname, 'chrome-extension/content.ts'),
        background: resolve(__dirname, 'chrome-extension/background.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    } : undefined,
  },
  test: {
    globals: true, // Allows using functions like 'describe', 'it', 'expect' globally
    environment: 'jsdom', // Simulates a browser environment for React components
    setupFiles: './src/setupTests.ts', // File to set up testing library extensions
    // Specify where tests are located
    include: ['**/*.test.{ts,tsx}'],
  },
})
