import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5700,
    host: true
  },
  preview: {
    port: 5700,
    host: true
  }
});
