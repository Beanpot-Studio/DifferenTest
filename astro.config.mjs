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
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY),
      'import.meta.env.VITE_CLOUDINARY_CLOUD_NAME': JSON.stringify(process.env.VITE_CLOUDINARY_CLOUD_NAME),
      'import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET': JSON.stringify(process.env.VITE_CLOUDINARY_UPLOAD_PRESET),
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(process.env.VITE_FIREBASE_API_KEY),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.VITE_FIREBASE_AUTH_DOMAIN),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(process.env.VITE_FIREBASE_PROJECT_ID),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.VITE_FIREBASE_STORAGE_BUCKET),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(process.env.VITE_FIREBASE_APP_ID),
    }
  },
  /*env: {
    schema: {
      CLOUDINARY_CLOUD_NAME: envField.string({ context: "client", access: "public" }),
      CLOUDINARY_UPLOAD_PRESET: envField.string({ context: "client", access: "public" }),
    }
  }*/
});
