import { defineConfig, envField } from 'astro/config';
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
    },
    envDir: '.',
    define: {
      'import.meta.env.PUBLIC_GEMINI_API_KEY': JSON.stringify(process.env.PUBLIC_GEMINI_API_KEY),
      'import.meta.env.CLOUDINARY_CLOUD_NAME': JSON.stringify(process.env.CLOUDINARY_CLOUD_NAME),
      'import.meta.env.CLOUDINARY_UPLOAD_PRESET': JSON.stringify(process.env.CLOUDINARY_UPLOAD_PRESET),
    }
  },
  /*env: {
    schema: {
      CLOUDINARY_CLOUD_NAME: envField.string({ context: "client", access: "public" }),
      CLOUDINARY_UPLOAD_PRESET: envField.string({ context: "client", access: "public" }),
    }
  }*/
});
