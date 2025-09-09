#!/usr/bin/env node

const { program } = require('commander')
const chalk = require('chalk')
const path = require('path')
const { version } = require('../package.json')
const SyncCommand = require('./commands/sync.cjs')
const PushCommand = require('./commands/push.cjs')

const isNpxExecution = __dirname.includes('_npx') || __dirname.includes('.npm')

let installer
try {
  if (isNpxExecution) {
    installer = require(
      path.join(__dirname, '..', 'tools', 'installer')
    ).installer
  } else {
    installer = require('../tools/installer').installer
  }
} catch (error) {
  console.error(chalk.red('Error loading installer:'), error.message)
  process.exit(1)
}

program
  .name('lerian-protocol')
  .version(version)
  .description(
    'Intelligent agent-based development workflow templates for Claude Code'
  )
  .configureOutput({
    writeOut: (str) => process.stdout.write(str),
    writeErr: (str) => process.stderr.write(str),
    outputError: (str, write) => write(chalk.red(str))
  })

program
  .command('install')
  .description(
    'Install Lerian Protocol workflow with profile-based agents and templates'
  )
  .argument('[directory]', 'project directory to install in', '.')
  .option(
    '--profile <profile>',
    'installation profile: frontend, backend, or full',
    null
  )
  .option('--dry-run', 'show what would be installed without making changes')
  .option('--force', 'force installation without prompts')
  .action(async (directory, options) => {
    try {
      const installOptions = {
        directory,
        profile: options.profile,
        stageGate: true,
        dryRun: options.dryRun,
        force: options.force
      }
      await installer.install(installOptions)
    } catch (error) {
      console.error(chalk.red('✗ Installation failed:'), error.message)
      process.exit(1)
    }
  })

program
  .command('status')
  .description('Show installation status')
  .action(async () => {
    try {
      await installer.status({})
    } catch (error) {
      console.error(chalk.red('✗ Status check failed:'), error.message)
      process.exit(1)
    }
  })

program
  .command('uninstall')
  .description('Remove Lerian Protocol installation')
  .option('--force', 'force uninstall without prompts')
  .action(async (options) => {
    try {
      await installer.uninstall({
        force: options.force
      })
    } catch (error) {
      console.error(chalk.red('✗ Uninstall failed:'), error.message)
      process.exit(1)
    }
  })

// Register sync and push commands
SyncCommand.register(program)
PushCommand.register(program)

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
  process.exit(0)
}
