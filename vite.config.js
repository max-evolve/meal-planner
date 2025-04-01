import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  base: '/meal-planner/', // Changed to match actual repository name
  build: {
    assetsInlineLimit: 0, // Disable inlining assets
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    }
  },
  publicDir: 'public', // Ensure public directory is correctly copied
});