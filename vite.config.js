import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],

  server: {
    // WSL2 / Windows cross-filesystem — ใช้ polling แทน inotify
    watch: {
      usePolling: true,
      interval:   500,
    },
  },
});
