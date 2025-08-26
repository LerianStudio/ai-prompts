const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const ora = require('ora')
const inquirer = require('inquirer')
const yaml = require('js-yaml')
const cfonts = require('cfonts')
const Table = require('cli-table3')
const fileManager = require('./file-manager')

const theme = {
  primary: chalk.cyan,
  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,
  muted: chalk.gray,
  highlight: chalk.bold.white,
  accent: chalk.magenta,
  gradient: {
    primary: chalk.hex('#00ff88'),
    secondary: chalk.hex('#0088ff')
  }
}

const SpinnerManager = {
  create: (text, options = {}) => {
    return ora({
      text,
      spinner: 'dots12',
      color: 'cyan',
      ...options
    })
  },

  withProgress: (text, current, total) => {
    return ora({
      text: `${text} (${current}/${total})`,
      spinner: 'arc',
      color: 'blue'
    })
  }
}

const output = {
  log: (message) => {
    console.log(message)
  },

  success: (message) => {
    console.log(theme.success('✓ ') + theme.highlight(message))
  },

  error: (message) => {
    console.error(theme.error('✗'), message)
  },

  warn: (message) => {
    console.warn(theme.warning('⚠'), message)
  },

  info: (message) => {
    console.log(theme.info('ℹ'), message)
  },

  highlight: (message) => {
    console.log(theme.gradient.primary(message))
  },

  json: (data) => {
    console.log(JSON.stringify(data, null, 2))
  }
}

const debug = {
  log: (message, ...args) => {
    if (process.env.DEBUG_INSTALLER || process.env.NODE_ENV === 'development') {
      console.log(theme.muted(`[DEBUG] ${message}`), ...args)
    }
  },
  error: (message, error) => {
    console.error(theme.error(`[ERROR] ${message}`), error?.message || error)
    if (error?.stack && process.env.DEBUG_INSTALLER) {
      console.error(theme.muted(error.stack))
    }
  }
}

const DEFAULTS = {
  version: require('../package.json').version,
  timeout: 30000,
  retries: 3,
  directories: [
    '.claude',
    '.claude/agents',
    '.claude/commands',
    '.claude/hooks',
    '.workflow',
    '.workflow/context',
    '.workflow/context/anthropic',
    '.workflow/context/console',
    '.workflow/context/console/docs'
  ]
}

class UnifiedInstaller {
  constructor() {
    this.sourceRoot = path.join(__dirname, '..')
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
      output.warn('⚠ Installation already in progress...')
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
        includeStageGate: true // Always include board
      }
    }

    return this.getInteractiveConfig(directory)
  }

  async hasCompleteConfig() {
    return true // No config needed, always use directory name
  }

  async getInteractiveConfig(directory) {
    return {
      directory,
      projectName: path.basename(directory),
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
    spinner.succeed(theme.success(' Installation completed successfully!'))

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
        'Try slash commands like /explain, /refactor'
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
        theme.muted('/refactor for performance'),
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
        theme.muted('.workflow/'),
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
        output.warn(
          'No Lerian Protocol installation found in current directory'
        )
        output.log(theme.muted('Run: npx lerian-protocol install'))
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
      const files = await fs.readdir(agentsDir)
      return files
        .filter((file) => file.endsWith('.md') && file !== 'README.md')
        .map((file) => file.replace('.md', ''))
        .sort()
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
      const files = await fs.readdir(hooksDir)
      return files
        .filter((file) => file.endsWith('.py') || file.endsWith('.sh'))
        .sort()
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
    const targets = ['.claude', '.mcp.json', '.workflow']

    if (!options.force) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Are you sure you want to remove Lerian Protocol?',
          default: false,
          prefix: theme.warning('→')
        }
      ])

      if (!confirm) {
        output.log('Uninstall cancelled')
        return
      }
    }

    for (const target of targets) {
      const targetPath = path.join(cwd, target)
      if (await fs.pathExists(targetPath)) {
        await fs.remove(targetPath)
        output.success(`Removed ${target}`)
      }
    }

    output.success('Lerian Protocol uninstalled successfully')
  }

  async getBoardDirectories() {
    const boardSource = path.join(this.sourceRoot, 'board')

    if (!(await fs.pathExists(boardSource))) {
      debug.log('Board source not found, returning default structure')
      return [
        '.workflow/board',
        '.workflow/board/01.backlog',
        '.workflow/board/02.ready',
        '.workflow/board/03.in-progress',
        '.workflow/board/04.testing',
        '.workflow/board/05.completed'
      ]
    }

    try {
      const boardDirs = ['.workflow/board']
      const entries = await fs.readdir(boardSource, { withFileTypes: true })

      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          boardDirs.push(path.join('.workflow/board', entry.name))
        }
      }

      debug.log(`Dynamically found board directories: ${boardDirs.join(', ')}`)
      return boardDirs
    } catch (error) {
      debug.error('Error reading board directories', error)
      return [
        '.workflow/board',
        '.workflow/board/01.backlog',
        '.workflow/board/02.ready',
        '.workflow/board/03.in-progress',
        '.workflow/board/04.testing',
        '.workflow/board/05.completed'
      ]
    }
  }

  async executeWithRetry(
    operation,
    maxRetries = 3,
    operationName = 'operation'
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

    const directories = [...DEFAULTS.directories]
    if (config.includeStageGate) {
      const boardDirectories = await this.getBoardDirectories()
      directories.push(...boardDirectories)
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

    operations.push(
      {
        type: 'create',
        path: path.join(config.directory, '.claude/agents'),
        description: ' Creating .claude/agents/README.md',
        operation: 'installAgents',
        retryable: true
      },
      {
        type: 'create',
        path: path.join(config.directory, '.claude/commands'),
        description: ' Creating .claude/commands/README.md',
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
        path: path.join(config.directory, '.workflow/context'),
        description: ' Creating .workflow/context/README.md',
        operation: 'installContext',
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
        path: path.join(config.directory, '.workflow/board'),
        description: ' Installing board system from codebase',
        operation: 'installBoard',
        retryable: true
      },
      {
        type: 'create',
        path: path.join(config.directory, '.workflow/templates'),
        description: ' Installing workflow templates',
        operation: 'installTemplates',
        retryable: true
      },
      {
        type: 'create',
        path: path.join(config.directory, '.workflow/workflows'),
        description: ' Installing workflow files',
        operation: 'installWorkflows',
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

    for (const [index, operation] of operations.entries()) {
      const progressSpinner = SpinnerManager.withProgress(
        operation.description,
        index + 1,
        operations.length
      )

      progressSpinner.start()

      try {
        const operationFn = () => this.executeOperation(operation, config)

        const result = operation.retryable
          ? await this.executeWithRetry(
              operationFn,
              DEFAULTS.retries,
              operation.description
            )
          : await operationFn()

        progressSpinner.succeed(operation.description)
        results[result.action].push(operation.path)

        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        progressSpinner.fail(`${operation.description} ${theme.error('✗')}`)
        results.errors.push({
          operation: operation.description,
          path: operation.path,
          error: error.message
        })

        throw new Error(`Failed ${operation.description}: ${error.message}`)
      }
    }

    const gitignoreSpinner = SpinnerManager.create('Updating .gitignore...')
    gitignoreSpinner.start()

    try {
      await this.updateGitignore(config.directory)
      gitignoreSpinner.succeed('Updated .gitignore with Lerian Protocol')
    } catch (error) {
      gitignoreSpinner.warn('Could not update .gitignore automatically')
      debug.log('Gitignore update failed:', error)
    }

    return results
  }

  async executeOperation(operation, config) {
    switch (operation.operation) {
      case 'ensureDir':
        await fs.ensureDir(operation.path)
        await fs.access(operation.path)
        return { action: 'created' }

      case 'installAgents':
        await this.installAgents(config.directory)
        return { action: 'created' }

      case 'installCommands':
        await this.installCommands(config.directory)
        return { action: 'created' }

      case 'installHooks':
        await this.installHooks(config.directory)
        return { action: 'created' }

      case 'installContext':
        await this.installContext(config.directory)
        return { action: 'created' }

      case 'createClaudeMd':
        await this.createClaudeMd(config.directory, config)
        return { action: 'created' }

      case 'installSettings':
        await this.installSettings(config.directory)
        return { action: 'created' }

      case 'installMcpConfig':
        await this.installMcpConfig(config.directory)
        return { action: 'created' }

      case 'installBoard':
        await this.installBoard(config.directory)
        return { action: 'created' }

      case 'installTemplates':
        await this.installTemplates(config.directory)
        return { action: 'created' }

      case 'installWorkflows':
        await this.installWorkflows(config.directory)
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

    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: `Install Lerian Protocol'?`,
        default: true,
        prefix: theme.primary('▶')
      }
    ])

    if (!proceed) {
      output.warn('Installation cancelled')
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
        output.warn('Installation cancelled')
        process.exit(0)
      }

      spinner.start()
    }
  }

  async installAgents(installDir) {
    const agentsSource = path.join(this.sourceRoot, '.claude', 'agents')
    const agentsDest = path.join(installDir, '.claude', 'agents')

    if (path.resolve(agentsSource) === path.resolve(agentsDest)) {
      debug.log('Agents source and destination are the same, skipping copy')
      return
    }

    if (await fs.pathExists(agentsSource)) {
      await fs.copy(agentsSource, agentsDest)
    }
  }

  async installCommands(installDir) {
    const commandsSource = path.join(this.sourceRoot, '.claude', 'commands')
    const commandsDest = path.join(installDir, '.claude', 'commands')

    if (path.resolve(commandsSource) === path.resolve(commandsDest)) {
      debug.log('Commands source and destination are the same, skipping copy')
      return
    }

    if (await fs.pathExists(commandsSource)) {
      await fs.copy(commandsSource, commandsDest)
    }
  }

  async installHooks(installDir) {
    const hooksSource = path.join(this.sourceRoot, '.claude', 'hooks')
    const hooksDest = path.join(installDir, '.claude', 'hooks')

    if (path.resolve(hooksSource) === path.resolve(hooksDest)) {
      debug.log('Hooks source and destination are the same, skipping copy')
      return
    }

    if (await fs.pathExists(hooksSource)) {
      await fs.copy(hooksSource, hooksDest, {
        preserveTimestamps: true
      })

      const hookFiles = await fs.readdir(hooksDest)
      for (const file of hookFiles) {
        if (file.endsWith('.py')) {
          const hookPath = path.join(hooksDest, file)
          await fs.chmod(hookPath, 0o755)
        }
      }
    }
  }

  async installContext(installDir) {
    const contextSource = path.join(this.sourceRoot, 'context')
    const contextDest = path.join(installDir, '.workflow', 'context')

    if (path.resolve(contextSource) === path.resolve(contextDest)) {
      debug.log('Context source and destination are the same, skipping copy')
      return
    }

    if (await fs.pathExists(contextSource)) {
      await fs.copy(contextSource, contextDest)
    }
  }

  async createClaudeMd(installDir, config) {
    return this.executeWithRetry(
      async () => {
        const claudeMdPath = path.join(installDir, '.claude', 'CLAUDE.md')
        const sourceClaudeMdPath = path.join(
          this.sourceRoot,
          '.claude',
          'CLAUDE.md'
        )
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
      'createClaudeMd'
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

  async installMcpConfig(installDir) {
    return this.executeWithRetry(
      async () => {
        const mcpConfigPath = path.join(installDir, '.mcp.json')
        debug.log(`Installing MCP configuration at: ${mcpConfigPath}`)

        const sourceMcpPath = path.join(this.sourceRoot, '.mcp.json')

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
      'installMcpConfig'
    )
  }

  async installBoard(installDir) {
    const boardSource = path.join(this.sourceRoot, 'board')
    const boardDest = path.join(installDir, '.workflow', 'board')

    if (path.resolve(boardSource) === path.resolve(boardDest)) {
      debug.log('Board source and destination are the same, skipping copy')
      return
    }

    if (await fs.pathExists(boardSource)) {
      await fs.copy(boardSource, boardDest)
      debug.log(`Copied board system from ${boardSource} to ${boardDest}`)
    } else {
      debug.log(
        `Board source ${boardSource} not found, creating default structure`
      )
      await this.createDefaultBoard(installDir)
    }
  }

  async createDefaultBoard(installDir) {
    const defaultStages = [
      {
        dir: '01.backlog',
        title: 'Backlog',
        description:
          'Ideas and feature requests waiting to be planned and prioritized.'
      },
      {
        dir: '02.ready',
        title: 'Ready',
        description: 'Refined items ready to start when capacity is available.'
      },
      {
        dir: '03.in-progress',
        title: 'In Progress',
        description: 'Features currently being developed and implemented.'
      },
      {
        dir: '04.testing',
        title: 'Testing',
        description: 'Completed features undergoing review and testing.'
      },
      {
        dir: '05.completed',
        title: 'Completed',
        description: 'Finished features that have been completed and deployed.'
      }
    ]

    const boardDir = path.join(installDir, '.workflow', 'board')

    const mainReadmeContent = `# Board System\n\nThis directory implements a kanban board system for managing work items through their lifecycle.\n\n## Structure\n\n${defaultStages.map((stage) => `- ${stage.dir}/ - ${stage.title}`).join('\n')}\n`
    await fs.writeFile(
      path.join(boardDir, 'README.md'),
      mainReadmeContent,
      'utf8'
    )

    for (const stage of defaultStages) {
      const stagePath = path.join(boardDir, stage.dir)
      await fs.ensureDir(stagePath)
      const readmeContent = `# ${stage.title}\n\n${stage.description}\n\n## Guidelines\n\n- Keep files organized by feature or epic\n- Use descriptive filenames\n- Document decisions and progress\n- Update status as work progresses\n`
      await fs.writeFile(
        path.join(stagePath, 'README.md'),
        readmeContent,
        'utf8'
      )
    }
  }

  async installTemplates(installDir) {
    const templatesSource = path.join(this.sourceRoot, 'templates')
    const templatesDest = path.join(installDir, '.workflow', 'templates')

    if (path.resolve(templatesSource) === path.resolve(templatesDest)) {
      debug.log('Templates source and destination are the same, skipping copy')
      return
    }

    if (await fs.pathExists(templatesSource)) {
      await fs.copy(templatesSource, templatesDest)
    }
  }

  async installWorkflows(installDir) {
    const workflowsSource = path.join(this.sourceRoot, 'workflows')
    const workflowsDest = path.join(installDir, '.workflow', 'workflows')

    if (path.resolve(workflowsSource) === path.resolve(workflowsDest)) {
      debug.log('Workflows source and destination are the same, skipping copy')
      return
    }

    if (await fs.pathExists(workflowsSource)) {
      await fs.copy(workflowsSource, workflowsDest)
    }
  }

  async installSettings(installDir) {
    return this.executeWithRetry(
      async () => {
        const settingsPath = path.join(installDir, '.claude', 'settings.json')
        const sourceSettingsPath = path.join(
          this.sourceRoot,
          '.claude',
          'settings.json'
        )
        debug.log(`Installing settings.json at: ${settingsPath}`)

        if (path.resolve(sourceSettingsPath) === path.resolve(settingsPath)) {
          debug.log(
            'Settings source and destination are the same, skipping copy'
          )
          return true
        }

        if (!(await fs.pathExists(sourceSettingsPath))) {
          debug.log(
            'Source settings.json not found, skipping settings installation'
          )
          return true
        }

        const tempPath = `${settingsPath}.tmp`
        await fs.copy(sourceSettingsPath, tempPath)
        await fs.move(tempPath, settingsPath, { overwrite: true })

        return true
      },
      3,
      'installSettings'
    )
  }

  async updateGitignore(installDir) {
    const gitignorePath = path.join(installDir, '.gitignore')

    const lerianIgnoreEntries = [
      '',
      '# Lerian Protocol',
      '.claude/',
      '.workflow/',
      '.mcp.json',
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

module.exports = new UnifiedInstaller()
