import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    vue(),
  ],
  server: {
    port: 5000,
    host: '0.0.0.0',
  },
  vite: {
    server: {
      hmr: {
        overlay: false,
      },
      watch: {
        usePolling: true
      },
      host: '0.0.0.0',
      port: 5000,
      fs: {
        strict: false,
      },
      cors: true,
      origin: '*',
      allowedHosts: ['localhost'],
    }
  }
});
