import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load env vars from ../../.env.dev
  const env = loadEnv(mode, path.resolve(__dirname, '../..'), '')

  const frontendPort = parseInt(env.FRONTEND_PORT) || 3003
  const boardApiPort = parseInt(env.BOARD_API_PORT) || 3020

  return {
  plugins: [react()],
  root: 'src',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: '../dist',
  },
    server: {
      host: true,
      port: frontendPort,
      proxy: {
        '/api': {
          target: `http://localhost:${boardApiPort}`,
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        },
      },
    },
  }
})