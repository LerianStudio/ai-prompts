#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import path from 'path'
import { version } from '../package.json'
import * as SyncCommand from './commands/sync'
import * as PushCommand from './commands/push'

interface InstallOptions {
  directory: string
  profile: string | null
  stageGate: boolean
  dryRun: boolean
  force: boolean
}

interface UninstallOptions {
  force: boolean
}

interface Installer {
  install(options: InstallOptions): Promise<void>
  status(options: {}): Promise<void>
  uninstall(options: UninstallOptions): Promise<void>
}

const isNpxExecution = __dirname.includes('_npx') || __dirname.includes('.npm')

let installer: Installer
try {
  if (isNpxExecution) {
    installer = require(path.join(__dirname, '..', 'tools', 'installer'))
  } else {
    // In compiled mode, use the compiled installer
    installer = require(path.join(__dirname, '..', 'tools', 'installer'))
  }
} catch (error) {
  console.error(chalk.red('Error loading installer:'), (error as Error).message)
  process.exit(1)
}

const program = new Command()

program
  .name('lerian-protocol')
  .version(version)
  .description(
    'Intelligent agent-based development workflow templates for Claude Code'
  )
  .configureOutput({
    writeOut: (str: string) => process.stdout.write(str),
    writeErr: (str: string) => process.stderr.write(str),
    outputError: (str: string, write: (str: string) => void) =>
      write(chalk.red(str))
  })

program
  .command('install')
  .description(
    'Install Lerian Protocol workflow with profile-based agents and templates'
  )
  .argument('[directory]', 'project directory to install in', '.')
  .option(
    '--profile <profile>',
    'installation profile: frontend, backend, or full'
  )
  .option('--dry-run', 'show what would be installed without making changes')
  .option('--force', 'force installation without prompts')
  .action(
    async (
      directory: string,
      options: { profile: string | null; dryRun?: boolean; force?: boolean }
    ) => {
      try {
        const installOptions: InstallOptions = {
          directory,
          profile: options.profile,
          stageGate: true,
          dryRun: options.dryRun ?? false,
          force: options.force ?? false
        }
        await installer.install(installOptions)
      } catch (error) {
        console.error(
          chalk.red('✗ Installation failed:'),
          (error as Error).message
        )
        process.exit(1)
      }
    }
  )

program
  .command('status')
  .description('Show installation status')
  .action(async () => {
    try {
      await installer.status({})
    } catch (error) {
      console.error(
        chalk.red('✗ Status check failed:'),
        (error as Error).message
      )
      process.exit(1)
    }
  })

program
  .command('uninstall')
  .description('Remove Lerian Protocol installation')
  .option('--force', 'force uninstall without prompts')
  .action(async (options: { force?: boolean }) => {
    try {
      await installer.uninstall({
        force: options.force ?? false
      })
    } catch (error) {
      console.error(chalk.red('✗ Uninstall failed:'), (error as Error).message)
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
