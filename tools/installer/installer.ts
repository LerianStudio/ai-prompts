import path from 'path'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import cfonts from 'cfonts'
import Table from 'cli-table3'
// import chalk from 'chalk'

import { theme, output } from './ui-theme'
import { debug } from './debug'
import { DEFAULTS } from './constants'

interface InstallConfig {
  directory: string
  projectName: string
  profile: string
  includeStageGate: boolean
}

interface InstallOptions {
  directory?: string
  projectName?: string
  profile?: string
  force?: boolean
  dryRun?: boolean
  json?: boolean
}

interface InstallOperation {
  type: 'create' | 'update' | 'delete'
  path: string
  description: string
  operation: string
  retryable: boolean
}

class Installer {
  private isProcessing: boolean
  private currentSpinner: any

  constructor() {
    this.isProcessing = false
    this.currentSpinner = null
    this.setupProcessHandlers()
  }

  private setupProcessHandlers(): void {
    const cleanup = (signal: string): void => {
      debug.log(`Received ${signal}, cleaning up...`)
      if (this.currentSpinner) {
        this.currentSpinner.fail('Installation interrupted')
      }
      process.exit(signal === 'SIGINT' ? 130 : 1)
    }

    process.on('SIGINT', () => cleanup('SIGINT'))
    process.on('SIGTERM', () => cleanup('SIGTERM'))
    process.on('uncaughtException', (error: Error) => {
      debug.error('Uncaught exception during installation', error)
      if (this.currentSpinner) {
        this.currentSpinner.fail('Installation failed due to unexpected error')
      }
      process.exit(1)
    })
  }

  // private getProfilePatterns(profile: string): string[] {
  //   const patterns: Record<string, string[]> = {
  //     frontend: ['frontend/**', 'shared/**'],
  //     backend: ['backend/**', 'shared/**'],
  //     full: ['frontend/**', 'backend/**', 'shared/**']
  //   }

  //   return patterns[profile] || patterns['full'] || []
  // }

  private showBanner(): void {
    try {
      console.clear()
      cfonts.say('LERIAN|PROTOCOL', {
        font: 'block',
        colors: ['#feed02', '#feed02'],
        space: false,
        lineHeight: 1
      })
      process.stdout.write('\x1b[2A')
    } catch {
      console.log(theme.gradient.primary('LERIAN PROTOCOL'))
    }
  }

  async install(options: InstallOptions): Promise<void> {
    if (this.isProcessing) {
      output.warning('Installation already in progress...')
      return
    }

    this.isProcessing = true
    debug.log('Starting installation with options:')
    this.showBanner()

    const config = await this.getInstallConfig(options)

    if (options.dryRun) {
      return this.showDryRun(config, options)
    }

    return this.performInstall(config, options)
  }

  private async getInstallConfig(
    options: InstallOptions
  ): Promise<InstallConfig> {
    const directory = path.resolve(options.directory || '.')

    if (options.force || (await this.hasCompleteConfig(options))) {
      return {
        directory,
        projectName: options.projectName || path.basename(directory),
        profile: options.profile || 'full',
        includeStageGate: true
      }
    }

    return this.getInteractiveConfig(directory, options)
  }

  private async hasCompleteConfig(options: InstallOptions): Promise<boolean> {
    return !!options.profile
  }

  private async getInteractiveConfig(
    directory: string,
    options: InstallOptions
  ): Promise<InstallConfig> {
    if (options.profile) {
      return {
        directory,
        projectName: path.basename(directory),
        profile: options.profile,
        includeStageGate: true
      }
    }

    console.log('')
    output.log(theme.primary('🎯 Select Installation Profile'))
    output.log(
      theme.muted('Choose the components you need for your project:\n')
    )

    const { selectedProfile } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedProfile',
        message: 'Which development profile best fits your project?',
        choices: [
          {
            name: `${theme.success('Frontend')}`,
            value: 'frontend',
            short: 'Frontend'
          },
          {
            name: `${theme.info('Backend')}`,
            value: 'backend',
            short: 'Backend'
          },
          {
            name: `${theme.accent('Full')}`,
            value: 'full',
            short: 'Full'
          }
        ],
        default: 0,
        prefix: theme.primary('▶')
      }
    ])

    return {
      directory,
      projectName: path.basename(directory),
      profile: selectedProfile,
      includeStageGate: true
    }
  }

  private async showDryRun(
    config: InstallConfig,
    options: InstallOptions
  ): Promise<void> {
    try {
      cfonts.say('DRY RUN', {
        font: 'tiny',
        colors: ['cyan', 'blue'],
        align: 'center',
        letterSpacing: 1
      })
    } catch {
      console.log(theme.primary('\n🔍 DRY RUN'))
    }

    console.log(theme.info('✓ Showing what would be installed:\n'))

    const operations = await this.planInstallation(config)

    const table = new Table({
      head: [
        theme.highlight('Operation'),
        theme.highlight('Path'),
        theme.highlight('Description')
      ],
      colWidths: [12, 45, 35],
      style: {
        head: ['cyan'],
        border: ['gray'],
        'padding-left': 1,
        'padding-right': 1
      },
      chars: {
        top: '═',
        'top-mid': '╤',
        'top-left': '╔',
        'top-right': '╗',
        bottom: '═',
        'bottom-mid': '╧',
        'bottom-left': '╚',
        'bottom-right': '╝',
        left: '║',
        'left-mid': '╟',
        mid: '─',
        'mid-mid': '┼',
        right: '║',
        'right-mid': '╢',
        middle: '│'
      }
    })

    for (const op of operations) {
      const colorFn =
        op.type === 'create'
          ? theme.success
          : op.type === 'update'
            ? theme.warning
            : theme.error
      const symbol =
        op.type === 'create' ? '➕' : op.type === 'update' ? '🔄' : '➖'

      table.push([
        colorFn(`${symbol} ${op.type.toUpperCase()}`),
        theme.muted(op.path),
        op.description || 'N/A'
      ])
    }

    console.log(table.toString())
    console.log(
      `\n${theme.success('✓')} ${theme.highlight(operations.length)} operations planned\n`
    )

    if (options.json) {
      output.json({
        dryRun: true,
        operations,
        config: config
      })
    }
  }

  async status(options: InstallOptions): Promise<void> {
    const cwd = process.cwd()
    const claudeDir = path.join(cwd, '.claude')

    if (!(await fs.pathExists(claudeDir))) {
      if (options.json) {
        output.json({ installed: false, message: 'No installation found' })
      } else {
        output.warning(
          'No Lerian Protocol installation found in current directory'
        )
        output.log(theme.muted('Run: lerian-protocol install'))
      }
      return
    }

    const actualAgents = await this.getInstalledAgents(cwd)
    const actualCommands = await this.getInstalledCommands(cwd)
    const actualHooks = await this.getInstalledHooks(cwd)

    if (options.json) {
      output.json({
        installed: true,
        location: cwd,
        version: DEFAULTS.version,
        projectName: path.basename(cwd),
        agents: {
          count: actualAgents.length,
          available: actualAgents
        },
        commands: {
          count: actualCommands.length,
          available: actualCommands
        },
        hooks: {
          count: actualHooks.length,
          available: actualHooks
        }
      })
    } else {
      const statusTable = new Table({
        chars: {
          top: '═',
          'top-mid': '╤',
          'top-left': '╔',
          'top-right': '╗',
          bottom: '═',
          'bottom-mid': '╧',
          'bottom-left': '╚',
          'bottom-right': '╝',
          left: '║',
          'left-mid': '╟',
          mid: '─',
          'mid-mid': '┼',
          right: '║',
          'right-mid': '╢',
          middle: '│'
        },
        style: {
          head: ['cyan'],
          border: ['gray'],
          'padding-left': 1,
          'padding-right': 1
        },
        colWidths: [15, 50]
      })

      statusTable.push(
        [
          {
            colSpan: 2,
            content: theme.primary('Installation Status'),
            hAlign: 'center'
          }
        ],
        ['Location', theme.muted(cwd)],
        ['Version', theme.success(DEFAULTS.version)],
        ['Project', theme.primary(path.basename(cwd))],
        ['Agents', theme.info(`${actualAgents.length} installed`)],
        ['Commands', theme.info(`${actualCommands.length} installed`)],
        ['Hooks', theme.info(`${actualHooks.length} installed`)]
      )

      console.log('\n' + statusTable.toString())
      console.log('\n' + theme.success('✅ Installation is healthy') + '\n')
    }
  }

  private async getInstalledAgents(installDir: string): Promise<string[]> {
    const agentsDir = path.join(installDir, '.claude', 'agents')

    if (!(await fs.pathExists(agentsDir))) {
      return []
    }

    try {
      const agents: string[] = []
      const scan = async (
        dir: string,
        relativePath: string = ''
      ): Promise<void> => {
        const entries = await fs.readdir(dir, { withFileTypes: true })
        for (const entry of entries) {
          if (entry.isDirectory() && !entry.name.startsWith('.')) {
            await scan(
              path.join(dir, entry.name),
              relativePath ? path.join(relativePath, entry.name) : entry.name
            )
          } else if (
            entry.isFile() &&
            entry.name.endsWith('.md') &&
            entry.name !== 'README.md'
          ) {
            const agentName = relativePath
              ? path.join(relativePath, entry.name.replace('.md', ''))
              : entry.name.replace('.md', '')
            agents.push(agentName)
          }
        }
      }

      await scan(agentsDir)
      return agents.sort()
    } catch (error) {
      debug.error('Error reading agents directory', error)
      return []
    }
  }

  private async getInstalledCommands(installDir: string): Promise<string[]> {
    const commandsDir = path.join(installDir, '.claude', 'commands')

    if (!(await fs.pathExists(commandsDir))) {
      return []
    }

    try {
      const files: string[] = []
      const scan = async (
        dir: string,
        relativePath: string = ''
      ): Promise<void> => {
        const entries = await fs.readdir(dir, { withFileTypes: true })
        for (const entry of entries) {
          if (entry.isDirectory() && !entry.name.startsWith('.')) {
            await scan(
              path.join(dir, entry.name),
              path.join(relativePath, entry.name)
            )
          } else if (
            entry.isFile() &&
            entry.name.endsWith('.md') &&
            entry.name !== 'README.md'
          ) {
            files.push(path.join(relativePath, entry.name).replace('.md', ''))
          }
        }
      }
      await scan(commandsDir)
      return files.sort()
    } catch (error) {
      debug.error('Error reading commands directory', error)
      return []
    }
  }

  private async getInstalledHooks(installDir: string): Promise<string[]> {
    const hooksDir = path.join(installDir, '.claude', 'hooks')

    if (!(await fs.pathExists(hooksDir))) {
      return []
    }

    try {
      const hooks: string[] = []
      const scan = async (
        dir: string,
        relativePath: string = ''
      ): Promise<void> => {
        const entries = await fs.readdir(dir, { withFileTypes: true })
        for (const entry of entries) {
          if (entry.isDirectory() && !entry.name.startsWith('.')) {
            await scan(
              path.join(dir, entry.name),
              relativePath ? path.join(relativePath, entry.name) : entry.name
            )
          } else if (
            entry.isFile() &&
            (entry.name.endsWith('.py') || entry.name.endsWith('.sh'))
          ) {
            const hookName = relativePath
              ? path.join(relativePath, entry.name)
              : entry.name
            hooks.push(hookName)
          }
        }
      }

      await scan(hooksDir)
      return hooks.sort()
    } catch (error) {
      debug.error('Error reading hooks directory', error)
      return []
    }
  }

  private async performInstall(
    _config: InstallConfig,
    _options: InstallOptions
  ): Promise<void> {
    throw new Error('Method not implemented')
  }

  private async planInstallation(
    _config: InstallConfig
  ): Promise<InstallOperation[]> {
    throw new Error('Method not implemented')
  }

  async uninstall(_options: InstallOptions): Promise<void> {
    throw new Error('Method not implemented')
  }

  async update(_options: InstallOptions): Promise<void> {
    throw new Error('Method not implemented')
  }
}

export default Installer
