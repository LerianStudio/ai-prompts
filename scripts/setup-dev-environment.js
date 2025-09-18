#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const net = require('net')

const PORTS_FILE = path.join(__dirname, '..', '.dev-ports.json')
const DEV_ASSETS_SEED = path.join(__dirname, '..', 'dev_assets_seed')
const DEV_ASSETS = path.join(__dirname, '..', 'dev_assets')

/**
 * Check if a port is available
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const sock = net.createConnection({ port, host: 'localhost' })
    sock.on('connect', () => {
      sock.destroy()
      resolve(false)
    })
    sock.on('error', () => resolve(true))
  })
}

/**
 * Find a free port starting from a given port
 */
async function findFreePort(startPort = 3000) {
  let port = startPort
  while (!(await isPortAvailable(port))) {
    port++
    if (port > 65535) {
      throw new Error('No available ports found')
    }
  }
  return port
}

/**
 * Load existing ports from file
 */
function loadPorts() {
  try {
    if (fs.existsSync(PORTS_FILE)) {
      const data = fs.readFileSync(PORTS_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.warn('Failed to load existing ports:', error.message)
  }
  return null
}

/**
 * Save ports to file
 */
function savePorts(ports) {
  try {
    fs.writeFileSync(PORTS_FILE, JSON.stringify(ports, null, 2))
  } catch (error) {
    console.error('Failed to save ports:', error.message)
    throw error
  }
}

/**
 * Verify that saved ports are still available
 */
async function verifyPorts(ports) {
  const checks = await Promise.all([
    isPortAvailable(ports.boardApi),
    isPortAvailable(ports.mcpServer),
    isPortAvailable(ports.frontend)
  ])

  const [boardApiAvailable, mcpServerAvailable, frontendAvailable] = checks

  if (
    process.argv[2] === 'get' &&
    (!boardApiAvailable || !mcpServerAvailable || !frontendAvailable)
  ) {
    console.log(
      `Port availability check failed: ` +
        `boardApi:${ports.boardApi}=${boardApiAvailable}, ` +
        `mcpServer:${ports.mcpServer}=${mcpServerAvailable}, ` +
        `frontend:${ports.frontend}=${frontendAvailable}`
    )
  }

  return boardApiAvailable && mcpServerAvailable && frontendAvailable
}

/**
 * Allocate ports for development
 */
async function allocatePorts() {
  // Try to load existing ports first
  const existingPorts = loadPorts()

  if (existingPorts) {
    // Verify existing ports are still available
    if (await verifyPorts(existingPorts)) {
      if (process.argv[2] === 'get') {
        console.log('Reusing existing dev ports:')
        console.log(`Board API: ${existingPorts.boardApi}`)
        console.log(`MCP Server: ${existingPorts.mcpServer}`)
        console.log(`Frontend: ${existingPorts.frontend}`)
      }
      return existingPorts
    } else {
      if (process.argv[2] === 'get') {
        console.log(
          'Existing ports are no longer available, finding new ones...'
        )
      }
    }
  }

  // Find new free ports
  const boardApiPort = await findFreePort(3001)
  const mcpServerPort = await findFreePort(boardApiPort + 1)
  const frontendPort = await findFreePort(mcpServerPort + 1)

  const ports = {
    boardApi: boardApiPort,
    mcpServer: mcpServerPort,
    frontend: frontendPort,
    timestamp: new Date().toISOString()
  }

  savePorts(ports)

  if (process.argv[2] === 'get') {
    console.log('Allocated new dev ports:')
    console.log(`Board API: ${ports.boardApi}`)
    console.log(`MCP Server: ${ports.mcpServer}`)
    console.log(`Frontend: ${ports.frontend}`)
  }

  return ports
}

/**
 * Get ports (allocate if needed)
 */
async function getPorts() {
  const ports = await allocatePorts()
  await seedDevAssets()
  await generateEnvConfig(ports)
  return ports
}

/**
 * Seed development assets
 */
async function seedDevAssets() {
  try {
    // Create dev_assets_seed if it doesn't exist
    if (!fs.existsSync(DEV_ASSETS_SEED)) {
      fs.mkdirSync(DEV_ASSETS_SEED, { recursive: true })

      // Create sample config files
      const sampleMcpConfig = {
        mcpServers: {
          'board-tasks': {
            command: 'node',
            args: ['services/board-mcp/src/index.js'],
            env: {
              BOARD_API_URL: 'http://localhost:{{BOARD_API_PORT}}',
              MCP_SERVER_PORT: '{{MCP_SERVER_PORT}}'
            }
          }
        }
      }

      fs.writeFileSync(
        path.join(DEV_ASSETS_SEED, 'mcp.json.template'),
        JSON.stringify(sampleMcpConfig, null, 2)
      )

      if (process.argv[2] === 'get') {
        console.log('Created dev_assets_seed with sample templates')
      }
    }

    if (!fs.existsSync(DEV_ASSETS)) {
      // Copy dev_assets_seed to dev_assets
      fs.cpSync(DEV_ASSETS_SEED, DEV_ASSETS, { recursive: true })

      if (process.argv[2] === 'get') {
        console.log('Seeded dev_assets from templates')
      }
    }
  } catch (error) {
    console.error('Failed to seed dev assets:', error.message)
  }
}

/**
 * Generate development environment configuration
 */
async function generateEnvConfig(ports) {
  try {
    const envContent = `# Generated by setup-dev-environment.js
# Do not edit manually - this file is regenerated on each dev startup

# Service Ports
BOARD_API_PORT=${ports.boardApi}
MCP_SERVER_PORT=${ports.mcpServer}
FRONTEND_PORT=${ports.frontend}

# Service URLs
BOARD_API_URL=http://localhost:${ports.boardApi}
MCP_SERVER_URL=http://localhost:${ports.mcpServer}
FRONTEND_URL=http://localhost:${ports.frontend}

# Development Configuration
NODE_ENV=development
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
ENABLE_CORS_LOGGING=true

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lerian_protocol

# Generated at: ${new Date().toISOString()}
`

    const envPath = path.join(__dirname, '..', '.env.dev')
    fs.writeFileSync(envPath, envContent)

    if (process.argv[2] === 'get') {
      console.log('Generated .env.dev with dynamic ports')
    }
  } catch (error) {
    console.error('Failed to generate env config:', error.message)
  }
}

/**
 * Clear saved ports and generated files
 */
function clearPorts() {
  try {
    const filesToClear = [PORTS_FILE, path.join(__dirname, '..', '.env.dev')]

    let cleared = 0
    filesToClear.forEach((file) => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file)
        cleared++
      }
    })

    // Also clear dev_assets
    if (fs.existsSync(DEV_ASSETS)) {
      fs.rmSync(DEV_ASSETS, { recursive: true, force: true })
      cleared++
    }

    if (cleared > 0) {
      console.log(`Cleared ${cleared} development files`)
    } else {
      console.log('No development files to clear')
    }
  } catch (error) {
    console.error('Failed to clear development files:', error.message)
  }
}

/**
 * Health check for services
 */
async function healthCheck(ports) {
  const services = [
    { name: 'Board API', port: ports.boardApi, path: '/health' },
    { name: 'MCP Server', port: ports.mcpServer, path: '/' }
  ]

  console.log('🔍 Checking service health...')

  for (const service of services) {
    const isRunning = !(await isPortAvailable(service.port))
    const status = isRunning ? '🟢 RUNNING' : '🔴 STOPPED'
    console.log(`  ${service.name} (${service.port}): ${status}`)
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2]

  switch (command) {
    case 'get':
      getPorts()
        .then((ports) => {
          console.log(JSON.stringify(ports))
        })
        .catch(console.error)
      break

    case 'clear':
      clearPorts()
      break

    case 'board-api':
      getPorts()
        .then((ports) => {
          console.log(ports.boardApi)
        })
        .catch(console.error)
      break

    case 'mcp-server':
      getPorts()
        .then((ports) => {
          console.log(ports.mcpServer)
        })
        .catch(console.error)
      break

    case 'frontend':
      getPorts()
        .then((ports) => {
          console.log(ports.frontend)
        })
        .catch(console.error)
      break

    case 'health':
      getPorts()
        .then((ports) => healthCheck(ports))
        .catch(console.error)
      break

    default:
      console.log('Usage:')
      console.log(
        '  node setup-dev-environment.js get        - Setup dev environment (ports + assets + config)'
      )
      console.log(
        '  node setup-dev-environment.js board-api  - Get Board API port only'
      )
      console.log(
        '  node setup-dev-environment.js mcp-server - Get MCP Server port only'
      )
      console.log(
        '  node setup-dev-environment.js frontend   - Get frontend port only'
      )
      console.log(
        '  node setup-dev-environment.js health     - Check service health status'
      )
      console.log(
        '  node setup-dev-environment.js clear      - Clear all generated dev files'
      )
      break
  }
}

module.exports = { getPorts, clearPorts, findFreePort, healthCheck }
