#!/usr/bin/env node

const { Command } = require('commander')
const chalk = require('chalk')
const path = require('path')
const ConfigManager = require('../../lib/config')

class SyncCommand {
  /**
   * Register the sync command with the main CLI program
   * @param {Command} program - Commander.js program instance
   */
  static register(program) {
    const syncCmd = new Command('sync')
      .description(
        'Synchronize .claude and protocol-assets directories between source and destination'
      )
      .option('-d, --dry-run', 'Preview changes without executing')
      .option('-i, --interactive', 'Interactive file selection mode')
      .option('--debug', 'Enable debug output and verbose logging')
      .addHelpText(
        'after',
        `
Examples:
  lerian sync                    # Standard sync operation
  lerian sync --dry-run          # Preview mode only
  lerian sync --interactive      # Choose files to sync
  lerian sync --debug            # Verbose output for troubleshooting

Note: This command must be run from within a project directory that has
Lerian Protocol installed. The command will automatically detect source
and destination paths based on the installation metadata.`
      )
      .action(this.execute.bind(this))

    program.addCommand(syncCmd)
  }

  /**
   * Execute the sync command with the provided options
   * @param {Object} options - Command options from commander.js
   */
  static async execute(options) {
    try {
      const configManager = new ConfigManager()
      const config = await configManager.getEnvironmentConfig()

      let CommandHeader, TerminalDetector

      try {
        CommandHeader = require('../../lib/components/CommandHeader')
        TerminalDetector = require('../../lib/utils/terminal')
      } catch {
        console.log(chalk.blue('🔄 Lerian Protocol Sync'))
        console.log(chalk.gray('Synchronizing .claude and protocol-assets'))
        console.log('')
      }

      const validation = await this.validateEnvironment()

      let terminalCaps = { width: 80, supportsColor: true }
      if (TerminalDetector) {
        terminalCaps = TerminalDetector.getCapabilities()
      }

      if (CommandHeader) {
        const header = new CommandHeader({
          title: 'Lerian Protocol Sync',
          subtitle: options.dryRun
            ? 'Preview Mode - No changes will be made'
            : 'Synchronizing .claude and protocol-assets',
          variant: 'standard',
          width: terminalCaps.width
        })
        console.log(header.render())
      }

      if (options.debug || config.cli.debugMode) {
        console.log(chalk.yellow('🐛 Debug mode enabled'))
        console.log('Command options:', JSON.stringify(options, null, 2))
        console.log(
          'Terminal capabilities:',
          JSON.stringify(terminalCaps, null, 2)
        )
        console.log(
          'Environment validation:',
          JSON.stringify(validation, null, 2)
        )
        console.log('Configuration:', JSON.stringify(config, null, 2))
        console.log('')
      }

      console.log(chalk.green('✅ Sync command structure is ready!'))
      console.log(
        chalk.gray(
          'Command execution logic will be implemented in subsequent sub-tasks'
        )
      )

      if (options.dryRun) {
        console.log(
          chalk.yellow('ℹ️ Dry-run mode: No actual changes would be made')
        )
      }

      if (options.interactive) {
        console.log(
          chalk.blue(
            'ℹ️ Interactive mode: User would be prompted for file selections'
          )
        )
      }
    } catch (error) {
      console.error(chalk.red('❌ Sync command failed:'), error.message)
      if (options.debug) {
        console.error(chalk.red('Stack trace:'), error.stack)
      }
      process.exit(1)
    }
  }

  /**
   * Validate that the command is being run in a valid environment
   */
  static async validateEnvironment() {
    const fs = require('fs-extra')
    const cwd = process.cwd()

    const hasPackageJson = await fs.pathExists(path.join(cwd, 'package.json'))
    const hasClaudeDir = await fs.pathExists(path.join(cwd, '.claude'))
    const hasProtocolAssets = await fs.pathExists(
      path.join(cwd, 'protocol-assets')
    )

    if (!hasPackageJson && !hasClaudeDir) {
      throw new Error(
        'This command must be run from a project directory with either package.json or .claude directory'
      )
    }

    if (hasPackageJson) {
      try {
        const packageJson = await fs.readJson(path.join(cwd, 'package.json'))

        const hasLerianProtocol =
          (packageJson.dependencies &&
            packageJson.dependencies['lerian-protocol']) ||
          (packageJson.devDependencies &&
            packageJson.devDependencies['lerian-protocol'])

        if (!hasLerianProtocol && !hasClaudeDir) {
          console.warn(
            chalk.yellow(
              '⚠️ Warning: Lerian Protocol not found in package.json dependencies'
            )
          )
        }
      } catch {
        console.warn(chalk.yellow('⚠️ Warning: Could not read package.json'))
      }
    }

    const paths = {
      '.claude': path.join(cwd, '.claude'),
      'protocol-assets': path.join(cwd, 'protocol-assets')
    }

    for (const [name, dirPath] of Object.entries(paths)) {
      try {
        await fs.ensureDir(dirPath)
      } catch (error) {
        throw new Error(
          `Cannot access or create ${name} directory: ${error.message}`
        )
      }
    }

    return {
      cwd,
      hasPackageJson,
      hasClaudeDir,
      hasProtocolAssets,
      paths
    }
  }

  /**
   * Get command exit codes for different scenarios
   */
  static getExitCodes() {
    return {
      SUCCESS: 0,
      GENERAL_ERROR: 1,
      INVALID_ENVIRONMENT: 2,
      USER_CANCELLATION: 3,
      VALIDATION_ERROR: 4,
      DEPENDENCY_ERROR: 5
    }
  }
}

module.exports = SyncCommand
