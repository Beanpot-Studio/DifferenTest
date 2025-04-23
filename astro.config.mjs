import { defineConfig, envField } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vue from '@astrojs/vue';
import { Sitemap } from '@astrojs/sitemap';
import { CloudinaryImageService } from '@astrojs/cloudinary';

// Only configure Cloudinary if environment variables are present
const cloudinaryConfig = import.meta.env.CLOUDINARY_CLOUD_NAME && import.meta.env.CLOUDINARY_API_KEY && import.meta.env.CLOUDINARY_API_SECRET
  ? {
      cloudName: import.meta.env.CLOUDINARY_CLOUD_NAME,
      apiKey: import.meta.env.CLOUDINARY_API_KEY,
      apiSecret: import.meta.env.CLOUDINARY_API_SECRET
    }
  : undefined;

// https://astro.build/config
export default defineConfig({
  site: 'https://differentest.com',
  integrations: [
    tailwind(),
    vue(),
    Sitemap(),
    ...(cloudinaryConfig ? [CloudinaryImageService(cloudinaryConfig)] : [])
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
      'import.meta.env.CLOUDINARY_API_KEY': JSON.stringify(process.env.CLOUDINARY_API_KEY),
      'import.meta.env.CLOUDINARY_API_SECRET': JSON.stringify(process.env.CLOUDINARY_API_SECRET),
    },
    optimizeDeps: {
      exclude: ['@astrojs/cloudinary']
    }
  },
  env: {
    schema: {
      CLOUDINARY_CLOUD_NAME: envField.string({ context: "client", access: "public" }),
      CLOUDINARY_UPLOAD_PRESET: envField.string({ context: "client", access: "public" }),
    }
  }
});
