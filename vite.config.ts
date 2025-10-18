/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true, // Allows using functions like 'describe', 'it', 'expect' globally
    environment: 'jsdom', // Simulates a browser environment for React components
    setupFiles: './src/setupTests.ts', // File to set up testing library extensions
    // Specify where tests are located
    include: ['**/*.test.{ts,tsx}'],
  },
})
