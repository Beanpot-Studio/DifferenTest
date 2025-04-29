import { defineConfig } from 'vitest/config'
import type { PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  // @ts-expect-error - Suppressing complex type mismatch between Vite/Vitest plugin types
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    exclude: [
        // Add patterns for files/directories to exclude from Vitest runs
        'node_modules/**',
        'dist/**',
        '**/e2e/**', // Example: if you had an e2e subfolder
        'tests/example.spec.ts', // Exclude the specific Playwright file
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.config.*',
        'src/main.ts',
        'src/lib/firebase*',
        'tests/**', // Keep excluding tests dir from coverage
      ],
    },
    include: ['tests/**/*.{test,spec}.{js,ts,jsx,tsx}'], // Keep this include pattern
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}) 