import { defineConfig } from 'vite';

export default defineConfig({
  // itch.io serves your game from a subfolder, so paths must be relative.
  base: './',
  build: {
    outDir: 'dist',
  },
});
