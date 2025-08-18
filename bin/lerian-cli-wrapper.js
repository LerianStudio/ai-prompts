#!/usr/bin/env node

/**
 * Lerian Protocol CLI - Direct execution wrapper
 * This file ensures proper execution when run via package runners (npx)
 */

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

// Check if we're running in a package runner temporary directory
const isPackageRunnerExecution =
  __dirname.includes('_npx') || __dirname.includes('.npm')

// If running via package runner (npx), we need to handle things differently
if (isPackageRunnerExecution) {
  const args = process.argv.slice(2)

  // Use the main CLI script
  const cliScriptPath = path.join(__dirname, 'lerian-protocol.js')

  if (!fs.existsSync(cliScriptPath)) {
    console.error('Error: Could not find lerian-protocol.js at', cliScriptPath)
    console.error('Current directory:', __dirname)
    process.exit(1)
  }

  try {
    execSync(`node "${cliScriptPath}" ${args.join(' ')}`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        // Preserve the original working directory where the package runner was called
        INIT_CWD: process.env.INIT_CWD || process.env.PWD || process.cwd(),
        PWD: process.env.INIT_CWD || process.env.PWD || process.cwd()
      }
    })
  } catch (error) {
    process.exit(error.status || 1)
  }
} else {
  // Local execution - just require the main CLI
  require('./lerian-protocol.js')
}
