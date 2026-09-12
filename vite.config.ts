import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, '../../docs/games/stack-beam'),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,
  },
});
