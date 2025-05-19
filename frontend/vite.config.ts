import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // <-- WICHTIG für Electron
  plugins: [react()],
  build: {
    outDir: 'dist-render'
  }
});
