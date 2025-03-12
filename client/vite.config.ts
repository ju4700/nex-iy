import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
    },
  },
  define: {
    global: 'window',
    'process.env': {},
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
    include: [
      'react',
      'react-dom',
      'socket.io-client',
    ],
    exclude: ['simple-peer'],
  },
  server: {
    port: parseInt(process.env.VITE_PORT || '3000'),
    open: true,
    host: 'localhost',
    hmr: { overlay: true },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('socket.io-client')) return 'socket-vendor';
            if (id.includes('simple-peer')) return 'webrtc-vendor';
            return 'vendor';
          }
        },
      },
    },
  },
});