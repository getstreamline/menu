import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    build: {
      outDir: 'dist', // Output directory
      sourcemap: isProduction ? true : 'inline',
      minify: 'terser',
      lib: {
        entry: './src/index.js', // Entry point of your library
        name: 'MenuModern',      // Global variable name when included via a script tag
        fileName: 'menu',        // Output file name (without extension)
        formats: ['iife'],       // Output format
      },
    },
  };
});
