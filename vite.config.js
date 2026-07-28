import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // .env dosyasındaki REACT_APP_ ve VITE_ değişkenlerini yükle
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    resolve: {
      alias: {
        src: path.resolve(__dirname, './src'),
        components: path.resolve(__dirname, './src/components'),
        contexts: path.resolve(__dirname, './src/contexts'),
        hooks: path.resolve(__dirname, './src/hooks'),
        layouts: path.resolve(__dirname, './src/layouts'),
        lib: path.resolve(__dirname, './src/lib'),
        views: path.resolve(__dirname, './src/views'),
        assets: path.resolve(__dirname, './src/assets'),
        'routes.js': path.resolve(__dirname, './src/routes.js'),
        routes: path.resolve(__dirname, './src/routes.js'),
      },
    },
    define: {
      'process.env': JSON.stringify(env),
    },
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: 'build',
    },
  };
});
