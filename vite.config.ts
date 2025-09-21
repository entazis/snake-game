import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['typescript'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
