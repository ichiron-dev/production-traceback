import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';  // ← เปลี่ยนตรงนี้

export default defineConfig({
  plugins: [
    sveltekit(),
    tailwindcss(),   // ← ย้ายมาไว้ใน plugins แทน css.postcss
  ],

  server: {
    watch: {
      usePolling: true,
      interval: 500,
    },
  },
});