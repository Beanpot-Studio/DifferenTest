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
      allowedHosts: ['localhost', 'beanpot-studio.github.io', 'differentest.club'],
    },
  },
  env: {
    schema: {
      PUBLIC_CLOUDINARY_CLOUD_NAME: envField.string({ context: "client", access: "public" }),
      PUBLIC_CLOUDINARY_UPLOAD_PRESET: envField.string({ context: "client", access: "public" }),
      PUBLIC_FIREBASE_API_KEY: envField.string({ context: "client", access: "public" }),
      PUBLIC_FIREBASE_AUTH_DOMAIN: envField.string({ context: "client", access: "public" }),
      PUBLIC_FIREBASE_PROJECT_ID: envField.string({ context: "client", access: "public" }),
      PUBLIC_FIREBASE_STORAGE_BUCKET: envField.string({ context: "client", access: "public" }),
      PUBLIC_FIREBASE_MESSAGING_SENDER_ID: envField.string({ context: "client", access: "public" }),
      PUBLIC_FIREBASE_APP_ID: envField.string({ context: "client", access: "public" }),
      PUBLIC_GEMINI_API_KEY: envField.string({ context: "client", access: "public" }),
      PUBLIC_BASE_URL: envField.string({ context: "client", access: "public" }),
    }
  }
});
