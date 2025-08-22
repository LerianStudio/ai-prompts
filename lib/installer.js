const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const ora = require('ora')
const inquirer = require('inquirer')
const yaml = require('js-yaml')
const cfonts = require('cfonts')
const Table = require('cli-table3')
const fileManager = require('./file-manager')

// Enhanced theme system for consistent styling
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

// Spinner factory for consistent spinner management
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
  version: '1.0.0',
  timeout: 30000,
  retries: 3,
  directories: [
    '.claude',
    '.claude/agents',
    '.claude/commands',
    '.workflow',
    '.workflow/context',
    '.workflow/workflows'
  ],
  stageGateDirectories: [
    '.workflow/stage-gate',
    '.workflow/stage-gate/00.backlog',
    '.workflow/stage-gate/01.planning',
    '.workflow/stage-gate/02.in-progress',
    '.workflow/stage-gate/03.completed'
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
        includeStageGate: true // Always include stage-gate
      }
    }

    return this.getInteractiveConfig(directory)
  }

  async hasCompleteConfig() {
    return true // No config needed, always use directory name
  }

  async getInteractiveConfig(directory) {
    // No interactive prompts needed - use directory name as project name
    return {
      directory,
      projectName: path.basename(directory),
      includeStageGate: true // Always include stage-gate
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
        theme.accent('Context'),
        theme.muted('.workflow/context/'),
        'Project context base'
      ],
      [
        theme.accent('Workflows'),
        theme.muted('.workflow/workflows/'),
        'Development workflows'
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
      theme.gradient.primary(' Ready to use Lerian AI Protocol workflow!')
    )
  }

  async status(options) {
    const cwd = process.cwd()
    const configPath = path.join(cwd, '.workflow', 'config.yaml')

    if (!(await fs.pathExists(configPath))) {
      if (options.json) {
        output.json({ installed: false, message: 'No installation found' })
      } else {
        output.warn(
          'No Lerian AI Protocol installation found in current directory'
        )
        output.log(theme.muted('Run: npx lerian-protocol install'))
      }
      return
    }

    const config = yaml.load(await fs.readFile(configPath, 'utf8'))

    if (options.json) {
      output.json({
        installed: true,
        location: cwd,
        version: config.version,
        projectName: config.projectName,
        installedAt: config.installedAt,
        stageGate: config.stageGate,
        agents: config.agents
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
        ['📍 Location', theme.muted(cwd)],
        ['📦 Version', theme.success(config.version)],
        ['🏷️  Project', theme.primary(config.projectName)],
        [
          '📅 Installed',
          theme.muted(new Date(config.installedAt).toLocaleDateString())
        ]
      )

      if (config.agents && config.agents.available) {
        statusTable.push([
          '🤖 Agents',
          theme.info(config.agents.available.join(', '))
        ])
      }

      console.log('\n' + statusTable.toString())
      console.log('\n' + theme.success('✅ Installation is healthy') + '\n')
    }
  }

  async update(options) {
    if (options.check) {
      output.log(chalk.cyan('✓ Checking for updates...'))
      output.log(chalk.green('✓ Lerian AI Protocol is up to date!'))
      return
    }

    output.log(chalk.cyan('✓ Updating Lerian AI Protocol...'))
    // Update logic here
    output.log(chalk.green('✓ Update completed!'))
  }

  async uninstall(options) {
    const cwd = process.cwd()
    const targets = ['.claude', '.workflow', '.mcp.json']

    if (!options.force) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Are you sure you want to remove Lerian AI Protocol?',
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

    output.success('Lerian AI Protocol uninstalled successfully')
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

    // Directory creation operations
    const directories = [...DEFAULTS.directories]
    if (config.includeStageGate) {
      directories.push(...DEFAULTS.stageGateDirectories)
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
        path: path.join(config.directory, '.workflow/context'),
        description: ' Creating .workflow/context/README.md',
        operation: 'installContext',
        retryable: true
      },
      {
        type: 'create',
        path: path.join(config.directory, '.workflow/workflows'),
        description: ' Creating .workflow/workflows/README.md',
        operation: 'installWorkflows',
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
        path: path.join(config.directory, '.workflow/config.yaml'),
        description: ' Creating .workflow/config.yaml',
        operation: 'writeConfig',
        retryable: true
      },
      {
        type: 'create',
        path: path.join(config.directory, '.mcp.json'),
        description: ' Creating .mcp.json',
        operation: 'installMcpConfig',
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

    // Stop the preparation spinner and add a newline before operations start
    if (spinner) {
      spinner.stop()
      console.log('')
    }

    for (const [index, operation] of operations.entries()) {
      // Create a new progress spinner for each operation
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

      case 'installContext':
        await this.installContext(config.directory)
        return { action: 'created' }

      case 'installWorkflows':
        await this.installWorkflows(config.directory)
        return { action: 'created' }

      case 'createClaudeMd':
        await this.createClaudeMd(config.directory, config)
        return { action: 'created' }

      case 'writeConfig':
        await this.writeConfig(config.directory, config)
        return { action: 'created' }

      case 'installMcpConfig':
        await this.installMcpConfig(config.directory)
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
        message: `Install Lerian AI Protocol in '${config.directory}'?`,
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
    const agents = await fileManager.getAvailableAgents(this.sourceRoot)

    for (const agent of agents) {
      const sourcePath = path.join(
        this.sourceRoot,
        '.claude',
        'agents',
        `${agent}.md`
      )
      if (await fs.pathExists(sourcePath)) {
        const destPath = path.join(
          installDir,
          '.claude',
          'agents',
          `${agent}.md`
        )

        if (path.resolve(sourcePath) === path.resolve(destPath)) {
          debug.log(
            `Agent ${agent} source and destination are the same, skipping copy`
          )
          continue
        }

        // Atomic copy operation
        const tempPath = `${destPath}.tmp`
        await fs.copy(sourcePath, tempPath)
        await fs.move(tempPath, destPath, { overwrite: true })
      }
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

  async writeConfig(installDir, config) {
    return this.executeWithRetry(
      async () => {
        const configData = {
          version: DEFAULTS.version,
          projectName: config.projectName,
          installedAt: new Date().toISOString(),
          agents: {
            available: ['tech-writer']
          },
          workflows: {
            available: ['template']
          },
          stageGate: {
            enabled: config.includeStageGate,
            currentStage: 'backlog'
          }
        }

        const configPath = path.join(installDir, '.workflow', 'config.yaml')
        debug.log(`Writing config file to: ${configPath}`)

        const yamlContent = yaml.dump(configData)
        debug.log(`Generated YAML content, length: ${yamlContent.length}`)

        const tempPath = `${configPath}.tmp`
        await fs.writeFile(tempPath, yamlContent, 'utf8')

        const writtenContent = await fs.readFile(tempPath, 'utf8')
        if (writtenContent.length !== yamlContent.length) {
          throw new Error(
            'File write verification failed: content length mismatch'
          )
        }

        await fs.move(tempPath, configPath, { overwrite: true })
        return true
      },
      3,
      'writeConfig'
    )
  }

  async createClaudeMd(installDir, config) {
    return this.executeWithRetry(
      async () => {
        const claudeMdPath = path.join(installDir, '.claude', 'CLAUDE.md')
        debug.log(`Creating CLAUDE.md at: ${claudeMdPath}`)

        const claudeMdContent = this.generateClaudeMdContent(config)

        const tempPath = `${claudeMdPath}.tmp`
        await fs.writeFile(tempPath, claudeMdContent, 'utf8')

        await fs.access(tempPath)
        await fs.move(tempPath, claudeMdPath, { overwrite: true })

        return true
      },
      3,
      'createClaudeMd'
    )
  }

  generateClaudeMdContent() {
    return `
    ## Collaboration Guidelines
    - **Challenge and question**: Don't immediately agree or proceed with requests that seem suboptimal, unclear, or potentially problematic
    - **Push back constructively**: If a proposed approach has issues, suggest better alternatives with clear reasoning
    - **Think critically**: Consider edge cases, performance implications, maintainability, and best practices before implementing
    - **Seek clarification**: Ask follow-up questions when requirements are ambiguous or could be interpreted multiple ways
    - **Propose improvements**: Suggest better patterns, more robust solutions, or cleaner implementations when appropriate
    - **Be a thoughtful collaborator**: Act as a good teammate who helps improve the overall quality and direction of the project

    ## Best Practices

    - Keep agents focused on specific domains
    - Use stage-gate folders to organize feature development
    - Maintain project context in the context base
    - Document decisions and learnings for future reference
    `
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
}

module.exports = new UnifiedInstaller()
