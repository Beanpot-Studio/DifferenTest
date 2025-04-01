export default {
  server: {
    hmr: {
      overlay: false,
    },
    watch: {
      usePolling: true,
    },
    host: '0.0.0.0',
    strictPort: true,
    port: 5000,
    fs: {
      strict: false,
    },
    // Allow all Replit domains
    cors: true,
    origin: '*',
    allowedHosts: ['localhost'],
  },
  preview: {
    host: '0.0.0.0',
    strictPort: true,
    port: 5000,
  },
};