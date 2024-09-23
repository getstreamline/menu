import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'i6a2ei',
  e2e: {
    baseUrl: 'http://localhost:5173', // Vite's default port
  },
  component: {
    devServer: {
      bundler: 'vite',
    },
  },
});
