import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load env vars from protocol-assets .env.dev (portable for any developer)
  const protocolAssetsRoot = path.resolve(__dirname, '../..')
  const env = loadEnv(mode, protocolAssetsRoot, '')

  // All ports must be defined in environment - no fallbacks
  const frontendPort = parseInt(env.FRONTEND_PORT || env.BOARD_UI_PORT)
  const boardApiPort = parseInt(env.BOARD_API_PORT)

  if (!frontendPort || !boardApiPort) {
    console.error('Missing required environment variables in .env.dev:')
    console.error('- FRONTEND_PORT:', env.FRONTEND_PORT || 'not set')
    console.error('- BOARD_UI_PORT:', env.BOARD_UI_PORT || 'not set')
    console.error('- BOARD_API_PORT:', env.BOARD_API_PORT || 'not set')
    console.error('Protocol assets root:', protocolAssetsRoot)
    console.error('Looking for .env.dev at:', path.join(protocolAssetsRoot, '.env.dev'))
    throw new Error('Frontend and API ports must be set in .env.dev')
  }

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
  define: {
    // Pass environment variables to the frontend
    'import.meta.env.VITE_API_PORT': JSON.stringify(env.BOARD_API_PORT),
    'import.meta.env.VITE_WS_PORT': JSON.stringify(env.BOARD_API_PORT), // WebSocket on same port as API
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(`http://localhost:${boardApiPort}`),
    'import.meta.env.VITE_WS_URL': JSON.stringify(`ws://localhost:${boardApiPort}`),
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