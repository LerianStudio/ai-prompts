#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const isPackageRunnerExecution =
  __dirname.includes('_npx') || __dirname.includes('.npm')
if (isPackageRunnerExecution) {
  const args = process.argv.slice(2)

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
        INIT_CWD: process.env.INIT_CWD || process.env.PWD || process.cwd(),
        PWD: process.env.INIT_CWD || process.env.PWD || process.cwd()
      }
    })
  } catch (error) {
    process.exit(error.status || 1)
  }
} else {
  require('./lerian-protocol.js')
}
