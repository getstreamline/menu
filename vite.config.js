import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  return {
    build: {
      outDir: 'dist', // Output directory
      minify: 'terser',
      lib: {
        entry: './src/MenuModern.js',
        name: 'MenuModern',
        fileName: 'menu-modern',
      },
    },
  };
});
