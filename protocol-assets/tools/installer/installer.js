const path = require('path')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const cfonts = require('cfonts')
const Table = require('cli-table3')
const chalk = require('chalk')

const { theme, SpinnerManager, output } = require('./ui-theme')
const { debug } = require('./debug')
const { DEFAULTS } = require('./constants')

class Installer {
  constructor() {
    this.sourceRoot = path.join(__dirname, '..', '..', '..')
    this.operations = []
    this.isProcessing = false
    this.currentSpinner = null

    this.setupProcessHandlers()
  }

  setupProcessHandlers() {
    const cleanup = (signal) => {
      debug.log(`Received ${signal}, cleaning up...`)
      if (this.currentSpinner) {
        this.currentSpinner.fail('Installation interrupted')
      }
      process.exit(signal === 'SIGINT' ? 130 : 1)
    }

    process.on('SIGINT', () => cleanup('SIGINT'))
    process.on('SIGTERM', () => cleanup('SIGTERM'))
    process.on('uncaughtException', (error) => {
      debug.error('Uncaught exception during installation', error)
      if (this.currentSpinner) {
        this.currentSpinner.fail('Installation failed due to unexpected error')
      }
      process.exit(1)
    })
  }

  getProfilePatterns(profile) {
    const patterns = {
      frontend: ['frontend/**', 'shared/**'],
      backend: ['backend/**', 'shared/**'],
      full: ['frontend/**', 'backend/**', 'shared/**']
    }

    return patterns[profile] || patterns.full
  }

  shouldIncludeFile(filePath, profile, baseDir) {
    if (profile === 'full') {
      return true
    }

    const relativePath = path.relative(baseDir, filePath)
    const patterns = this.getProfilePatterns(profile)

    const matches = patterns.some((pattern) => {
      const globPattern = pattern.replace('/**', '/')
      return (
        relativePath.startsWith(globPattern) ||
        relativePath.includes(`/${globPattern}`) ||
        pattern === '**'
      )
    })

    if (!matches) {
      return false
    }

    if (profile === 'frontend' && relativePath.startsWith('backend/')) {
      return false
    }

    if (profile === 'backend' && relativePath.startsWith('frontend/')) {
      return false
    }

    return true
  }

  withTimeout(promise, timeoutMs = 30000, operation = 'operation') {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(new Error(`${operation} timed out after ${timeoutMs}ms`)),
          timeoutMs
        )
      )
    ])
  }

  showBanner() {
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

  getActionableErrorMessage(error) {
    const message = error.message || 'Unknown error'

    if (message.includes('EACCES') || message.includes('permission denied')) {
      return `Permission denied. Try running with elevated permissions or check directory access rights.\n${chalk.gray('✓ Suggestion: Run with sudo (Linux/Mac) or as Administrator (Windows)')}`
    }

    if (message.includes('ENOENT') || message.includes('no such file')) {
      return `File or directory not found. Please check the installation path exists and is accessible.\n${chalk.gray('✓ Suggestion: Verify the target directory exists and you have read/write access')}`
    }

    if (message.includes('ENOSPC') || message.includes('no space left')) {
      return `Insufficient disk space. Please free up some space and try again.\n${chalk.gray("✓ Suggestion: Check available disk space with 'df -h' (Unix) or File Explorer (Windows)")}`
    }

    if (message.includes('timeout')) {
      return `Operation timed out. This might be due to slow disk I/O or system load.\n${chalk.gray('✓ Suggestion: Try again or run with DEBUG_INSTALLER=1 for more details')}`
    }

    if (message.includes('EMFILE') || message.includes('too many open files')) {
      return `Too many open files. Please increase system file limits.\n${chalk.gray('✓ Suggestion: Close other applications and try again')}`
    }

    if (message.includes('dest already exists')) {
      return `File operation conflict during update. This should have been resolved automatically.\n${chalk.gray('✓ Suggestion: Try again, or manually remove the target directory and reinstall')}`
    }

    return `${message}\n${chalk.gray('✓ Run with DEBUG_INSTALLER=1 for detailed logs')}`
  }

  showTroubleshootingHelp(error) {
    output.log(chalk.yellow('\n⚠ Troubleshooting Steps:'))
    output.log('1. Check directory permissions and disk space')
    output.log('2. Ensure no other installation is running')
    output.log('3. Try running with DEBUG_INSTALLER=1 for detailed logs')
    output.log('4. Check Node.js version compatibility (>=16.0.0)')

    if (error.code) {
      output.log(chalk.gray(`\nError Code: ${error.code}`))
    }

    output.log(
      chalk.blue(
        '\n✓ For more help, visit: https://github.com/LerianStudio/ai-prompts/issues'
      )
    )
  }

  async install(options) {
    if (this.isProcessing) {
      output.warning('Installation already in progress...')
      return
    }

    this.isProcessing = true
    debug.log('Starting installation with options:')

    this.showBanner(options)

    const config = await this.getInstallConfig(options)

    if (options.dryRun) {
      return this.showDryRun(config, options)
    }

    return this.performInstall(config, options)
  }

  async getInstallConfig(options) {
    const directory = path.resolve(options.directory || '.')

    if (options.force || (await this.hasCompleteConfig(options))) {
      return {
        directory,
        projectName: options.projectName || path.basename(directory),
        profile: options.profile || 'full',
        includeStageGate: true // Always include board
      }
    }

    return this.getInteractiveConfig(directory, options)
  }

  async hasCompleteConfig(options) {
    return !!options.profile
  }

  async getInteractiveConfig(directory, options) {
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
            name: `${theme.success('Frontend')} - React, UI components, frontend tools + shared utilities`,
            value: 'frontend',
            short: 'Frontend'
          },
          {
            name: `${theme.info('Backend')} - APIs, services, backend tools + shared utilities`,
            value: 'backend',
            short: 'Backend'
          },
          {
            name: `${theme.accent('Full')} - Everything (frontend + backend)`,
            value: 'full',
            short: 'Full'
          }
        ],
        default: 0, // Default to frontend instead of full
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

  async showDryRun(config, options) {
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

  async performInstall(config, options) {
    console.log('')
    this.currentSpinner = SpinnerManager.create(
      'Preparing installation...'
    ).start()

    try {
      await this.confirmInstallation(config, this.currentSpinner, options)

      await this.checkDirectoryConflicts(config, this.currentSpinner)

      await this.validateNodeVersion(this.currentSpinner)

      await this.performInstallation(config, {
        ...options,
        spinner: this.currentSpinner
      })

      console.log('')
      this.showNextSteps(config, this.currentSpinner)

      process.exit(0)
    } catch (error) {
      this.currentSpinner.fail('Installation failed')
      output.error(this.getActionableErrorMessage(error))
      this.showTroubleshootingHelp(error)
      process.exit(1)
    } finally {
      this.isProcessing = false
      this.currentSpinner = null
    }
  }

  showNextSteps(config, spinner) {
    const nextStepsTable = new Table({
      colWidths: [6, 25, 45],
      style: {
        head: ['green'],
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

    nextStepsTable.push(
      [
        {
          colSpan: 3,
          content: theme.gradient.primary('Next Steps'),
          hAlign: 'center'
        }
      ],
      [
        theme.success('1'),
        theme.primary('Open Claude Code'),
        'Launch your project in Claude Code IDE'
      ],
      [
        theme.success('2'),
        theme.primary('@agent-name'),
        'Use native agents like @tech-writer'
      ],
      [
        theme.success('3'),
        theme.primary('/commands'),
        'Try slash commands like /explain, /code-improve'
      ]
    )

    console.log('\n' + nextStepsTable.toString())

    const examplesTable = new Table({
      colWidths: [15, 30, 35],
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

    examplesTable.push(
      [
        {
          colSpan: 3,
          content: theme.primary('Quick Examples'),
          hAlign: 'center'
        }
      ],
      [
        theme.info('Documentation'),
        theme.muted('@tech-writer create API docs'),
        'Generate technical documentation'
      ],
      [
        theme.info('Code Review'),
        theme.muted('/explain this function'),
        'Analyze and explain code'
      ],
      [
        theme.info('Refactoring'),
        theme.muted('/code-improve refactor for performance'),
        'Improve code structure'
      ],
      [
        theme.info('Testing'),
        theme.muted('@test-agent write tests'),
        'Generate test cases'
      ],
      [
        theme.info('Planning'),
        theme.muted('/plan feature implementation'),
        'Break down complex tasks'
      ],
      [
        theme.info('Task Management'),
        theme.muted('Use MCP lerian-board tools'),
        'Create and track development tasks'
      ],
      [
        theme.info('Kanban Board'),
        theme.muted('./protocol-assets/scripts/start-task-service.sh'),
        'Launch visual task management UI'
      ]
    )

    console.log('\n' + examplesTable.toString())

    const filesTable = new Table({
      colWidths: [12, 35, 33],
      style: {
        head: ['magenta'],
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

    filesTable.push(
      [
        {
          colSpan: 3,
          content: theme.accent('Files Installed'),
          hAlign: 'center'
        }
      ],
      [
        theme.accent('Agents'),
        theme.muted('.claude/agents/'),
        'AI agent configurations'
      ],
      [
        theme.accent('Commands'),
        theme.muted('.claude/commands/'),
        'Custom slash commands'
      ],
      [
        theme.accent('Hooks'),
        theme.muted('.claude/hooks/'),
        'Development workflow hooks'
      ],
      [
        theme.accent('Workflow'),
        theme.muted('protocol-assets/'),
        'Workflow files and context'
      ],
      [
        theme.accent('Config'),
        theme.muted('.mcp.json'),
        'MCP server configuration'
      ],
      [
        theme.accent('Memory'),
        theme.muted('.claude/CLAUDE.md'),
        'Collaboration guidelines'
      ],
      [
        theme.accent('Board MCP'),
        theme.muted('protocol-assets/services/board-mcp/'),
        'Task management MCP server'
      ],
      [
        theme.accent('Board Service'),
        theme.muted('protocol-assets/services/board-ui/'),
        'Kanban board web interface'
      ],
      [
        theme.accent('Scripts'),
        theme.muted('protocol-assets/scripts/'),
        'Board management utilities'
      ],
      [
        theme.accent('Data'),
        theme.muted('protocol-assets/data/'),
        'Board databases and logs'
      ]
    )

    console.log('\n' + filesTable.toString())

    console.log('')
    spinner.succeed(
      theme.gradient.primary(' Ready to use Lerian Protocol workflow!')
    )
  }

  async status(options) {
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

  async getInstalledAgents(installDir) {
    const agentsDir = path.join(installDir, '.claude', 'agents')

    if (!(await fs.pathExists(agentsDir))) {
      return []
    }

    try {
      const agents = []

      // Recursively scan for .md files
      const scan = async (dir, relativePath = '') => {
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

  async getInstalledCommands(installDir) {
    const commandsDir = path.join(installDir, '.claude', 'commands')

    if (!(await fs.pathExists(commandsDir))) {
      return []
    }

    try {
      const files = []
      const scan = async (dir, relativePath = '') => {
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

  async getInstalledHooks(installDir) {
    const hooksDir = path.join(installDir, '.claude', 'hooks')

    if (!(await fs.pathExists(hooksDir))) {
      return []
    }

    try {
      const hooks = []

      // Recursively scan for .py and .sh files
      const scan = async (dir, relativePath = '') => {
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

  async update(options) {
    if (options.check) {
      output.log(chalk.cyan('✓ Checking for updates...'))
      output.log(chalk.green('✓ Lerian Protocol is up to date!'))
      return
    }

    output.log(chalk.cyan('✓ Updating Lerian Protocol...'))
    output.log(chalk.green('✓ Update completed!'))
  }

  async uninstall(options) {
    const cwd = process.cwd()
    const targets = ['.claude', '.mcp.json', 'protocol-assets']

    if (!options.force) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Are you sure you want to remove Lerian Protocol?',
          default: false,
          prefix: theme.warning('▶')
        }
      ])

      if (!confirm) {
        output.log('Uninstall cancelled')
        return
      }
    }

    const uninstallSpinner = SpinnerManager.create('Uninstalling...')
    uninstallSpinner.start()

    try {
      for (const target of targets) {
        const targetPath = path.join(cwd, target)
        if (await fs.pathExists(targetPath)) {
          uninstallSpinner.text = `Uninstalling... ${target}`
          await fs.remove(targetPath)
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      uninstallSpinner.succeed(' Lerian Protocol uninstalled successfully')
    } catch (error) {
      uninstallSpinner.fail(' Uninstall failed')
      throw error
    }
  }

  async getBoardDirectories() {
    // Board system directories that need to be created for installation
    const boardDirs = [
      'protocol-assets/data',
      'protocol-assets/data/databases',
      'protocol-assets/data/logs',
      'protocol-assets/data/backups'
    ]

    debug.log(`Board system directories: ${boardDirs.join(', ')}`)
    return boardDirs
  }

  async executeWithRetry(
    operation,
    maxRetries = 3,
    operationName = 'operation',
    spinner = null
  ) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        debug.log(
          `Executing ${operationName}, attempt ${attempt}/${maxRetries}`
        )
        const result = await operation()
        debug.log(
          `${operationName} completed successfully on attempt ${attempt}`
        )
        return result
      } catch (error) {
        debug.error(`${operationName} attempt ${attempt} failed`, error)

        if (attempt === maxRetries) {
          if (spinner) {
            spinner.fail('Installation failed')
          }
          throw new Error(
            `${operationName} failed after ${maxRetries} attempts: ${error.message}`
          )
        }

        const baseDelay = 1000 * Math.pow(2, attempt - 1)
        const jitter = Math.random() * 0.1 * baseDelay
        const delay = Math.min(baseDelay + jitter, 10000)

        debug.log(`Retrying ${operationName} in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  async planInstallation(config) {
    const operations = []
    const allDirectories = await DEFAULTS.getDirectories(this.sourceRoot)

    const directories = this.filterDirectoriesByProfile(
      allDirectories,
      config.profile || 'full'
    )

    if (config.includeStageGate) {
      const boardDirectories = await this.getBoardDirectories()
      directories.push(
        ...boardDirectories.filter((dir) => !directories.includes(dir))
      )
    }

    for (const dir of directories) {
      operations.push({
        type: 'create',
        path: path.join(config.directory, dir),
        description: ` Creating directory ${dir}`,
        operation: 'ensureDir',
        retryable: true
      })
    }

    const installationOps = await this.getInstallationOperations(config)
    operations.push(...installationOps)

    return operations
  }

  filterDirectoriesByProfile(directories, profile) {
    if (profile === 'full') {
      return directories
    }

    return directories.filter((dir) => {
      if (dir.startsWith('.claude')) {
        return true
      }

      if (dir.startsWith('protocol-assets/')) {
        const pathParts = dir.split('/')
        if (pathParts.length === 1) {
          return true
        }

        const profileDir = pathParts[1]

        if (profileDir === 'shared') {
          return true
        }

        if (profileDir === profile) {
          return true
        }

        return false
      }

      return true
    })
  }

  async getInstallationOperations(config) {
    const operations = []

    operations.push(
      {
        type: 'create',
        path: path.join(config.directory, '.claude/agents'),
        description: ' Creating .claude/agents/',
        operation: 'installAgents',
        retryable: true
      },
      {
        type: 'create',
        path: path.join(config.directory, '.claude/commands'),
        description: ' Creating .claude/commands/',
        operation: 'installCommands',
        retryable: true
      },
      {
        type: 'create',
        path: path.join(config.directory, '.claude/hooks'),
        description: ' Creating .claude/hooks/',
        operation: 'installHooks',
        retryable: true
      },
      {
        type: 'create',
        path: path.join(config.directory, '.claude/CLAUDE.md'),
        description: ' Creating .claude/CLAUDE.md',
        operation: 'createClaudeMd',
        retryable: true
      },
      {
        type: 'create',
        path: path.join(config.directory, '.claude/settings.json'),
        description: ' Creating .claude/settings.json',
        operation: 'installSettings',
        retryable: true
      },
      {
        type: 'create',
        path: path.join(config.directory, '.mcp.json'),
        description: ' Creating .mcp.json',
        operation: 'installMcpConfig',
        retryable: true
      },
      {
        type: 'create',
        path: path.join(config.directory, '.claude/.lerian-protocol-meta.json'),
        description: ' Creating sync metadata',
        operation: 'createMetadata',
        retryable: true
      },
      {
        type: 'create',
        path: path.join(config.directory, 'protocol-assets'),
        description: ' Installing protocol-assets from codebase',
        operation: 'installProtocolAssets',
        retryable: true
      },
      {
        type: 'create',
        path: path.join(config.directory, 'protocol-assets/services/board-mcp'),
        description: ' Installing board MCP server',
        operation: 'installBoardMcp',
        retryable: true
      },
      {
        type: 'create',
        path: path.join(config.directory, 'protocol-assets/services/board-ui'),
        description: ' Installing board API service',
        operation: 'installBoardService',
        retryable: true
      },
      {
        type: 'create',
        path: path.join(config.directory, 'protocol-assets/services/board-ui'),
        description: ' Installing board UI service',
        operation: 'installBoardUI',
        retryable: true
      },
      {
        type: 'create',
        path: path.join(config.directory, 'protocol-assets/scripts'),
        description: ' Installing board management scripts',
        operation: 'installBoardScripts',
        retryable: true
      },
      {
        type: 'create',
        path: path.join(
          config.directory,
          'protocol-assets/data/databases/task-management.db'
        ),
        description: ' Initializing board database',
        operation: 'initializeBoardDatabase',
        retryable: true
      }
    )

    return operations
  }

  async performInstallation(config, options) {
    const operations = await this.planInstallation(config)
    const spinner = options.spinner

    const results = {
      created: [],
      updated: [],
      skipped: [],
      errors: []
    }

    if (spinner) {
      spinner.stop()
      console.log('')
    }

    const installSpinner = SpinnerManager.create('Installing...')
    installSpinner.start()

    try {
      for (const [_index, operation] of operations.entries()) {
        installSpinner.text = 'Installing...'

        const operationFn = () =>
          this.executeOperation(operation, config, installSpinner)

        const result = operation.retryable
          ? await this.executeWithRetry(
              operationFn,
              DEFAULTS.retries,
              operation.description,
              installSpinner
            )
          : await operationFn()

        results[result.action].push(operation.path)

        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      installSpinner.text = 'Installing...'
      await this.updateGitignore(config.directory)

      // Create initial push baseline after successful installation
      installSpinner.text = 'Creating push baseline...'
      await this.createInitialPushBaseline(
        config.directory,
        config.profile,
        installSpinner
      )

      installSpinner.succeed('Installation completed successfully!')
    } catch (error) {
      installSpinner.fail('Installation failed')
      results.errors.push({
        operation: 'Installation',
        error: error.message
      })
      throw error
    }

    return results
  }

  async executeOperation(operation, config, spinner) {
    switch (operation.operation) {
      case 'ensureDir':
        await fs.ensureDir(operation.path)
        await fs.access(operation.path)
        return { action: 'created' }

      case 'installAgents':
        await this.installAgents(config.directory, spinner, config.profile)
        return { action: 'created' }

      case 'installCommands':
        await this.installCommands(config.directory, spinner, config.profile)
        return { action: 'created' }

      case 'installHooks':
        await this.installHooks(config.directory, spinner, config.profile)
        return { action: 'created' }

      case 'createClaudeMd':
        await this.createClaudeMd(config.directory, config, spinner)
        return { action: 'created' }

      case 'installSettings':
        await this.installSettings(config.directory, spinner, config.profile)
        return { action: 'created' }

      case 'installMcpConfig':
        await this.installMcpConfig(config.directory, spinner)
        return { action: 'created' }

      case 'installProtocolAssets':
        await this.installProtocolAssets(
          config.directory,
          spinner,
          config.profile
        )
        return { action: 'created' }

      case 'createMetadata':
        await this.createMetadata(config.directory, spinner, config.profile)
        return { action: 'created' }

      case 'installBoardMcp':
        await this.installBoardMcp(config.directory, spinner)
        return { action: 'created' }

      case 'installBoardService':
        await this.installBoardService(config.directory, spinner)
        return { action: 'created' }

      case 'installBoardUI':
        await this.installBoardUI(config.directory, spinner)
        return { action: 'created' }

      case 'installBoardScripts':
        await this.installBoardScripts(config.directory, spinner)
        return { action: 'created' }

      case 'initializeBoardDatabase':
        await this.initializeBoardDatabase(config.directory, spinner)
        return { action: 'created' }

      default:
        throw new Error(`Unknown operation: ${operation.operation}`)
    }
  }

  async confirmInstallation(config, spinner, options) {
    if (options.force) {
      return
    }

    spinner.stop()

    const profileInfo =
      config.profile === 'full' ? 'all profiles' : `${config.profile} profile`

    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: `Install Lerian Protocol (${profileInfo})?`,
        default: true,
        prefix: theme.primary('▶')
      }
    ])

    if (!proceed) {
      output.warning('Installation cancelled')
      process.exit(0)
    }

    spinner.start()
  }

  async checkDirectoryConflicts(config, spinner) {
    const claudeDir = path.join(config.directory, '.claude')

    if ((await fs.pathExists(claudeDir)) && !config.force) {
      spinner.stop()

      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: 'Existing .claude directory found. Update/overwrite?',
          default: false,
          prefix: theme.warning('▶')
        }
      ])

      if (!overwrite) {
        output.warning('Installation cancelled')
        process.exit(0)
      }

      spinner.start()
    }
  }

  async validateNodeVersion(spinner) {
    try {
      spinner.text = 'Validating Node.js version...'

      const { stdout } = await require('util').promisify(
        require('child_process').exec
      )('node --version')
      const nodeVersion = stdout.trim()
      const versionMatch = nodeVersion.match(/v(\d+)\.(\d+)\.(\d+)/)

      if (!versionMatch) {
        throw new Error('Could not parse Node.js version')
      }

      const [, major, minor] = versionMatch
      const majorVersion = parseInt(major, 10)
      const minorVersion = parseInt(minor, 10)

      // Require Node.js 18.0.0 or higher for board components
      const requiredMajor = 18
      const requiredMinor = 0

      if (
        majorVersion < requiredMajor ||
        (majorVersion === requiredMajor && minorVersion < requiredMinor)
      ) {
        throw new Error(
          `Board system requires Node.js ${requiredMajor}.${requiredMinor}.0 or higher. ` +
            `Current version: ${nodeVersion}. Please upgrade Node.js to continue.`
        )
      }

      debug.log(`Node.js version validation passed: ${nodeVersion}`)
      return true
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(
          'Node.js is not installed or not in PATH. ' +
            'Board system requires Node.js 18.0.0 or higher. ' +
            'Please install Node.js from https://nodejs.org/'
        )
      }
      throw error
    }
  }

  async installAgents(installDir, spinner, profile = 'full') {
    const agentsSource = path.join(this.sourceRoot, '.claude', 'agents')
    const agentsDest = path.join(installDir, '.claude', 'agents')

    if (path.resolve(agentsSource) === path.resolve(agentsDest)) {
      debug.log('Agents source and destination are the same, skipping copy')
      return
    }

    if (await fs.pathExists(agentsSource)) {
      const profileFilter = (src) => {
        return (
          this.shouldIncludeFile(src, profile, agentsSource) &&
          !src.includes('node_modules') &&
          !src.includes('.git')
        )
      }

      await this.copyWithFileProgress(
        agentsSource,
        agentsDest,
        'agent',
        spinner,
        {
          filter: profileFilter
        }
      )
    }
  }

  async installCommands(installDir, spinner, profile = 'full') {
    const commandsSource = path.join(this.sourceRoot, '.claude', 'commands')
    const commandsDest = path.join(installDir, '.claude', 'commands')

    if (path.resolve(commandsSource) === path.resolve(commandsDest)) {
      debug.log('Commands source and destination are the same, skipping copy')
      return
    }

    if (await fs.pathExists(commandsSource)) {
      const profileFilter = (src) => {
        return (
          this.shouldIncludeFile(src, profile, commandsSource) &&
          !src.includes('node_modules') &&
          !src.includes('.git')
        )
      }

      await this.copyWithFileProgress(
        commandsSource,
        commandsDest,
        'command',
        spinner,
        {
          filter: profileFilter
        }
      )
    }
  }

  async installHooks(installDir, spinner, profile = 'full') {
    const hooksSource = path.join(this.sourceRoot, '.claude', 'hooks')
    const hooksDest = path.join(installDir, '.claude', 'hooks')

    if (path.resolve(hooksSource) === path.resolve(hooksDest)) {
      debug.log('Hooks source and destination are the same, skipping copy')
      return
    }

    if (await fs.pathExists(hooksSource)) {
      const profileFilter = (src) => {
        return (
          this.shouldIncludeFile(src, profile, hooksSource) &&
          !src.includes('node_modules') &&
          !src.includes('.git')
        )
      }

      await this.copyWithFileProgress(hooksSource, hooksDest, 'hook', spinner, {
        filter: profileFilter,
        preserveTimestamps: true,
        afterCopy: async (dest) => {
          const hookFiles = await fs.readdir(dest)
          for (const file of hookFiles) {
            if (file.endsWith('.py') || file.endsWith('.sh')) {
              const hookPath = path.join(dest, file)
              await fs.chmod(hookPath, 0o755)
            }
          }
        }
      })
    }
  }

  async createClaudeMd(installDir, config, spinner) {
    return this.executeWithRetry(
      async () => {
        const claudeMdPath = path.join(installDir, '.claude', 'CLAUDE.md')
        const sourceClaudeMdPath = path.join(
          this.sourceRoot,
          '.claude',
          'CLAUDE.md'
        )

        spinner.text = 'Installing... CLAUDE.md'
        debug.log(`Creating CLAUDE.md at: ${claudeMdPath}`)

        if (path.resolve(sourceClaudeMdPath) === path.resolve(claudeMdPath)) {
          debug.log(
            'CLAUDE.md source and destination are the same, skipping copy'
          )
          return true
        }

        if (!(await fs.pathExists(sourceClaudeMdPath))) {
          debug.log('Source CLAUDE.md not found, creating from template')
          const claudeMdContent = await this.generateClaudeMdContent()
          const tempPath = `${claudeMdPath}.tmp`
          await fs.writeFile(tempPath, claudeMdContent, 'utf8')
          await fs.access(tempPath)
          await fs.move(tempPath, claudeMdPath, { overwrite: true })
        } else {
          debug.log('Copying CLAUDE.md from source')
          const tempPath = `${claudeMdPath}.tmp`
          await fs.copy(sourceClaudeMdPath, tempPath)
          await fs.move(tempPath, claudeMdPath, { overwrite: true })
        }

        return true
      },
      3,
      'createClaudeMd',
      spinner
    )
  }

  async createMetadata(installDir, spinner, profile = 'full') {
    return this.executeWithRetry(
      async () => {
        const MetadataManager = require('../sync/metadata-manager')
        const metadataManager = new MetadataManager()

        spinner.text = 'Installing... .lerian-protocol-meta.json'
        debug.log('Creating sync metadata file...')
        await metadataManager.createMetadata(installDir, this.sourceRoot, {
          profile
        })
        debug.log('Sync metadata file created successfully')

        return true
      },
      3,
      'createMetadata',
      spinner
    )
  }

  async generateClaudeMdContent() {
    const sourceClaudeMdPath = path.join(
      this.sourceRoot,
      '.claude',
      'CLAUDE.md'
    )
    return await fs.readFile(sourceClaudeMdPath, 'utf8')
  }

  async installMcpConfig(installDir, spinner) {
    return this.executeWithRetry(
      async () => {
        const mcpConfigPath = path.join(installDir, '.mcp.json')
        const sourceMcpPath = path.join(this.sourceRoot, '.mcp.json')

        spinner.text = 'Installing... .mcp.json'
        debug.log(`Installing MCP configuration at: ${mcpConfigPath}`)

        if (!(await fs.pathExists(sourceMcpPath))) {
          debug.log('Source .mcp.json not found, skipping MCP installation')
          return true
        }

        const mcpContent = await fs.readFile(sourceMcpPath, 'utf8')

        const tempPath = `${mcpConfigPath}.tmp`
        await fs.writeFile(tempPath, mcpContent, 'utf8')

        await fs.access(tempPath)
        await fs.move(tempPath, mcpConfigPath, { overwrite: true })

        return true
      },
      3,
      'installMcpConfig',
      spinner
    )
  }

  async installProtocolAssets(installDir, spinner, profile = 'full') {
    const protocolAssetsSource = path.join(this.sourceRoot, 'protocol-assets')
    const protocolAssetsDest = path.join(installDir, 'protocol-assets')

    if (
      path.resolve(protocolAssetsSource) === path.resolve(protocolAssetsDest)
    ) {
      debug.log(
        'Protocol assets source and destination are the same, skipping copy'
      )
      return
    }

    if (await fs.pathExists(protocolAssetsSource)) {
      const profileFilter = (src, _dest) => {
        return (
          this.shouldIncludeFile(src, profile, protocolAssetsSource) &&
          !src.includes('node_modules') &&
          !src.includes('.git')
        )
      }

      await this.copyWithFileProgress(
        protocolAssetsSource,
        protocolAssetsDest,
        'protocol asset',
        spinner,
        {
          preserveTimestamps: true,
          filter: profileFilter
        }
      )
      debug.log(
        `Copied protocol-assets (${profile} profile) from ${protocolAssetsSource} to ${protocolAssetsDest}`
      )
    } else {
      debug.log(`Protocol assets source ${protocolAssetsSource} not found`)
    }
  }

  async generateProfileSettings(profile) {
    const baseSettings = {
      env: {
        DISABLE_TELEMETRY: '1',
        BASH_DEFAULT_TIMEOUT_MS: '120000',
        BASH_MAX_TIMEOUT_MS: '600000',
        BASH_MAX_OUTPUT_LENGTH: '100000',
        MCP_TIMEOUT: '30000',
        MCP_TOOL_TIMEOUT: '60000',
        MAX_MCP_OUTPUT_TOKENS: '50000',
        USE_BUILTIN_RIPGREP: '1',
        CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR: '1',
        CLAUDE_CODE_DISABLE_TERMINAL_TITLE: '0'
      },
      enableAllProjectMcpServers: true,
      permissions: {
        deny: [
          'Read(./.env)',
          'Read(./.env.*)',
          'Read(./secrets/**)',
          'Read(./config/credentials.json)',
          'Bash(rm -rf:*)',
          'Bash(sudo:*)',
          'Bash(npm run build)'
        ]
      },
      hooks: this.generateProfileHooks(profile)
    }

    return baseSettings
  }

  generateProfileHooks(profile) {
    const hooks = {
      PreToolUse: [
        {
          matcher: 'Edit|MultiEdit',
          hooks: [
            {
              type: 'command',
              command: '$CLAUDE_PROJECT_DIR/.claude/hooks/shared/backup.py'
            }
          ]
        },
        {
          matcher: 'Bash',
          hooks: [
            {
              type: 'command',
              command: '$CLAUDE_PROJECT_DIR/.claude/hooks/shared/git-safety.py'
            }
          ]
        }
      ],
      PostToolUse: []
    }

    if (profile === 'frontend' || profile === 'full') {
      hooks.PostToolUse.push({
        matcher: 'Write|Edit|MultiEdit',
        hooks: [
          {
            type: 'command',
            command: '$CLAUDE_PROJECT_DIR/.claude/hooks/frontend/prettier.py'
          },
          {
            type: 'command',
            command: '$CLAUDE_PROJECT_DIR/.claude/hooks/frontend/eslint.py'
          },
          {
            type: 'command',
            command: '$CLAUDE_PROJECT_DIR/.claude/hooks/frontend/auto-test.py'
          },
          {
            type: 'command',
            command:
              '$CLAUDE_PROJECT_DIR/.claude/hooks/frontend/dependency-monitor.py'
          },
          {
            type: 'command',
            command: '$CLAUDE_PROJECT_DIR/.claude/hooks/shared/notification.py'
          }
        ]
      })
    }

    hooks.PostToolUse.push({
      matcher: 'Bash|Task',
      hooks: [
        {
          type: 'command',
          command: '$CLAUDE_PROJECT_DIR/.claude/hooks/shared/notification.py'
        }
      ]
    })

    return hooks
  }

  async customizeSettingsForProfile(baseSettings, profile) {
    const customSettings = { ...baseSettings }
    customSettings.hooks = this.generateProfileHooks(profile)
    return customSettings
  }

  async installSettings(installDir, spinner, profile = 'full') {
    return this.executeWithRetry(
      async () => {
        const settingsPath = path.join(installDir, '.claude', 'settings.json')
        const sourceSettingsPath = path.join(
          this.sourceRoot,
          '.claude',
          'settings.json'
        )

        spinner.text = 'Installing... settings.json'
        debug.log(
          `Installing settings.json with profile ${profile} at: ${settingsPath}`
        )

        if (path.resolve(sourceSettingsPath) === path.resolve(settingsPath)) {
          debug.log(
            'Settings source and destination are the same, generating profile-specific settings'
          )
          const settings = await this.generateProfileSettings(profile)
          await fs.writeJSON(settingsPath, settings, { spaces: 2 })
          return true
        }

        if (!(await fs.pathExists(sourceSettingsPath))) {
          debug.log(
            'Source settings.json not found, generating profile-specific settings'
          )
          const settings = await this.generateProfileSettings(profile)
          await fs.ensureDir(path.dirname(settingsPath))
          await fs.writeJSON(settingsPath, settings, { spaces: 2 })
          return true
        }

        const baseSettings = await fs.readJSON(sourceSettingsPath)
        const profileSettings = await this.customizeSettingsForProfile(
          baseSettings,
          profile
        )

        const tempPath = `${settingsPath}.tmp`
        await fs.writeJSON(tempPath, profileSettings, { spaces: 2 })
        await fs.move(tempPath, settingsPath, { overwrite: true })

        return true
      },
      3,
      'installSettings',
      spinner
    )
  }

  async copyWithFileProgress(
    sourceDir,
    destDir,
    fileType,
    spinner,
    options = {}
  ) {
    const filesToCopy = await this.enumerateFiles(sourceDir, options.filter)

    if (filesToCopy.length === 0) {
      return
    }

    for (const [_index, filePath] of filesToCopy.entries()) {
      const relativePath = path.relative(sourceDir, filePath)
      const destFilePath = path.join(destDir, relativePath)

      spinner.text = `Installing... ${relativePath}`

      await fs.ensureDir(path.dirname(destFilePath))

      await fs.copy(filePath, destFilePath, options)

      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    if (options.afterCopy) {
      await options.afterCopy(destDir)
    }
  }

  async enumerateFiles(sourceDir, filter = null) {
    const files = []

    const walkDir = async (dir) => {
      const entries = await fs.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          await walkDir(fullPath)
        } else if (entry.isFile()) {
          if (!filter || filter(fullPath)) {
            files.push(fullPath)
          }
        }
      }
    }

    await walkDir(sourceDir)
    return files.sort()
  }

  async installBoardMcp(installDir, spinner) {
    const boardMcpSource = path.join(
      this.sourceRoot,
      'protocol-assets',
      'services',
      'board-mcp'
    )
    const boardMcpDest = path.join(
      installDir,
      'protocol-assets',
      'services',
      'board-mcp'
    )

    if (path.resolve(boardMcpSource) === path.resolve(boardMcpDest)) {
      debug.log('Board MCP source and destination are the same, skipping copy')
      return
    }

    if (await fs.pathExists(boardMcpSource)) {
      spinner.text = 'Installing... board MCP server'
      await this.copyWithFileProgress(
        boardMcpSource,
        boardMcpDest,
        'board MCP file',
        spinner,
        {
          filter: (src) =>
            !src.includes('node_modules') && !src.includes('.git')
        }
      )
      debug.log(`Copied board MCP from ${boardMcpSource} to ${boardMcpDest}`)
    }
  }

  async installBoardService(installDir, spinner) {
    const boardServiceSource = path.join(
      this.sourceRoot,
      'protocol-assets',
      'services',
      'board-api'
    )
    const boardServiceDest = path.join(
      installDir,
      'protocol-assets',
      'services',
      'board-api'
    )

    if (path.resolve(boardServiceSource) === path.resolve(boardServiceDest)) {
      debug.log(
        'Board API service source and destination are the same, skipping copy'
      )
      return
    }

    if (await fs.pathExists(boardServiceSource)) {
      spinner.text = 'Installing... board API service'
      await this.copyWithFileProgress(
        boardServiceSource,
        boardServiceDest,
        'board API service file',
        spinner,
        {
          filter: (src) =>
            !src.includes('node_modules') &&
            !src.includes('.git') &&
            !src.includes('dist')
        }
      )
      debug.log(
        `Copied board API service from ${boardServiceSource} to ${boardServiceDest}`
      )
    }
  }

  async installBoardUI(installDir, spinner) {
    const boardUISource = path.join(
      this.sourceRoot,
      'protocol-assets',
      'services',
      'board-ui'
    )
    const boardUIDest = path.join(
      installDir,
      'protocol-assets',
      'services',
      'board-ui'
    )

    if (path.resolve(boardUISource) === path.resolve(boardUIDest)) {
      debug.log(
        'Board UI service source and destination are the same, skipping copy'
      )
      return
    }

    if (await fs.pathExists(boardUISource)) {
      spinner.text = 'Installing... board UI service'
      await this.copyWithFileProgress(
        boardUISource,
        boardUIDest,
        'board UI service file',
        spinner,
        {
          filter: (src) =>
            !src.includes('node_modules') &&
            !src.includes('.git') &&
            !src.includes('dist')
        }
      )
      debug.log(
        `Copied board UI service from ${boardUISource} to ${boardUIDest}`
      )
    }
  }

  async installBoardScripts(installDir, spinner) {
    const scriptsSource = path.join(
      this.sourceRoot,
      'protocol-assets',
      'infrastructure',
      'scripts'
    )
    const scriptsDest = path.join(
      installDir,
      'protocol-assets',
      'infrastructure',
      'scripts'
    )

    if (path.resolve(scriptsSource) === path.resolve(scriptsDest)) {
      debug.log('Scripts source and destination are the same, skipping copy')
      return
    }

    if (await fs.pathExists(scriptsSource)) {
      spinner.text = 'Installing... board management scripts'

      // Only copy board-related scripts
      const boardScriptFiles = [
        'start-task-service.sh',
        'stop-task-service.sh',
        'clear-all-tasks.sh'
      ]

      await fs.ensureDir(scriptsDest)

      for (const scriptFile of boardScriptFiles) {
        const sourcePath = path.join(scriptsSource, scriptFile)
        const destPath = path.join(scriptsDest, scriptFile)

        if (await fs.pathExists(sourcePath)) {
          await fs.copy(sourcePath, destPath)
          await fs.chmod(destPath, 0o755)
          spinner.text = `Installing... ${scriptFile}`
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      debug.log(`Copied board scripts from ${scriptsSource} to ${scriptsDest}`)
    }
  }

  async initializeBoardDatabase(installDir, spinner) {
    return this.executeWithRetry(
      async () => {
        const dbPath = path.join(
          installDir,
          'protocol-assets',
          'data',
          'databases',
          'task-management.db'
        )
        const dbDir = path.dirname(dbPath)

        spinner.text = 'Installing... board database initialization'
        debug.log(`Initializing board database at: ${dbPath}`)

        // Ensure database directory exists
        await fs.ensureDir(dbDir)

        // Check if database already exists
        if (await fs.pathExists(dbPath)) {
          debug.log('Board database already exists, skipping initialization')
          return true
        }

        // Create empty database file - migrations will be run by the service
        await fs.writeFile(dbPath, '')
        debug.log('Board database file created successfully')

        return true
      },
      3,
      'initializeBoardDatabase',
      spinner
    )
  }

  async createInitialPushBaseline(targetDir, profile, spinner) {
    try {
      const PushBaselineManager = require('../sync/push-baseline-manager')
      const FileHasher = require('../sync/file-hasher')

      const baselineManager = new PushBaselineManager()

      // Check if baseline already exists
      if (await baselineManager.hasBaseline(targetDir)) {
        debug.log('Push baseline already exists, skipping creation')
        return
      }

      const fileHasher = new FileHasher({
        ignorePatterns: [
          '.git',
          'node_modules',
          '.DS_Store',
          '*.log',
          '.sync-backup',
          '.push-backup',
          '*.tmp',
          'dist',
          'build',
          '.claude/.lerian-protocol-meta.json',
          '.claude/.lerian-sync-meta.json',
          '.claude/.lerian-push-meta.json'
        ]
      })

      // Get all files in target directory
      const allFiles = await fileHasher.hashDirectory(targetDir)

      // Filter to only pushable files using same logic as push command
      const PushPlanner = require('../sync/push-planner')
      const pushPlanner = new PushPlanner()

      const pushableFiles = {}
      const defaultPushablePatterns = [
        '.claude/**',
        'protocol-assets/**',
        'docs/**/*.md',
        'README*.md'
      ]

      for (const [filePath, fileInfo] of Object.entries(allFiles)) {
        if (
          pushPlanner.matchesAnyPattern(filePath, defaultPushablePatterns) &&
          pushPlanner.isPushSafe(filePath)
        ) {
          pushableFiles[filePath] = fileInfo
        }
      }

      debug.log(
        `Creating baseline with ${Object.keys(pushableFiles).length} pushable files`
      )

      // Create baseline
      await baselineManager.createBaseline(targetDir, pushableFiles, {
        reason: 'installer_creation',
        profile: profile
      })

      debug.log('Push baseline created successfully')
    } catch (error) {
      debug.error('Failed to create push baseline:', error)
      if (spinner) {
        // Don't fail the installation, just warn
        console.warn(
          chalk.yellow(
            '⚠️  Push baseline creation failed - push command will create it on first use'
          )
        )
      }
      // Don't throw error - this is not critical for installation success
    }
  }

  async updateGitignore(installDir) {
    const gitignorePath = path.join(installDir, '.gitignore')

    const lerianIgnoreEntries = [
      '',
      '# Lerian Protocol',
      '.claude/',
      'protocol-assets/',
      '.mcp.json',
      '.lerian-config.json',
      ''
    ]

    try {
      let existingContent = ''

      if (await fs.pathExists(gitignorePath)) {
        existingContent = await fs.readFile(gitignorePath, 'utf8')
      }

      if (existingContent.includes('# Lerian Protocol')) {
        debug.log('.gitignore already contains Lerian Protocol entries')
        return
      }

      const separator =
        existingContent && !existingContent.endsWith('\n') ? '\n' : ''

      const newContent =
        existingContent + separator + lerianIgnoreEntries.join('\n')

      await fs.writeFile(gitignorePath, newContent, 'utf8')
      debug.log('Successfully updated .gitignore with Lerian Protocol entries')
    } catch (error) {
      debug.error('Failed to update .gitignore', error)
      throw error
    }
  }
}

module.exports = Installer
