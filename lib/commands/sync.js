/**
 * Sync Command Implementation
 * Integrated sync functionality for the main lerian-protocol CLI
 */

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const os = require('os');

// Import sync components
const InteractiveSync = require('../components/InteractiveSync');

/**
 * Auto-detect Lerian Protocol installation
 */
async function findLerianProtocolPath() {
  const possiblePaths = [
    // Look in common development locations
    path.join(os.homedir(), 'Documents', 'Lerian', 'ai-prompts'),
    path.join(os.homedir(), 'lerian-protocol'),
    path.join(os.homedir(), 'ai-prompts'),
    path.join(os.homedir(), 'Development', 'lerian-protocol'),
    path.join(os.homedir(), 'Projects', 'lerian-protocol'),
    
    // Look in parent directories
    path.resolve('..', 'lerian-protocol'),
    path.resolve('..', 'ai-prompts'),
    path.resolve('../..', 'lerian-protocol'),
    path.resolve('../..', 'ai-prompts'),
  ];

  for (const possiblePath of possiblePaths) {
    try {
      const packagePath = path.join(possiblePath, 'package.json');
      if (await fs.pathExists(packagePath)) {
        const packageData = await fs.readJson(packagePath);
        if (packageData.name === 'lerian-protocol') {
          return possiblePath;
        }
      }
    } catch {
      // Continue searching
    }
  }

  return null;
}

/**
 * Check if we're running from within lerian-protocol itself
 */
function isRunningFromLerianProtocol() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageData = require(packagePath);
      return packageData.name === 'lerian-protocol';
    }
  } catch {
    // Not running from lerian-protocol
  }
  return false;
}

/**
 * Main sync command handler
 */
async function runSync(destination, options) {
  console.log(chalk.cyan('🎯 Lerian Protocol Sync'));
  console.log();

  const sourcePath = path.resolve(options.source);
  let destPath = destination;

  // Auto-detect destination if not provided
  if (!destPath) {
    console.log(chalk.gray('🔍 Auto-detecting Lerian Protocol location...'));
    
    if (isRunningFromLerianProtocol()) {
      console.error(chalk.red('❌ Error: Cannot sync from within lerian-protocol directory'));
      console.log(chalk.gray('Run this command from your project directory, not from lerian-protocol itself'));
      process.exit(1);
    }

    destPath = await findLerianProtocolPath();
    
    if (!destPath) {
      console.error(chalk.red('❌ Error: Could not auto-detect Lerian Protocol location'));
      console.log();
      console.log(chalk.yellow('💡 Please specify the destination path:'));
      console.log(chalk.gray('   lerian-protocol sync /path/to/lerian-protocol'));
      console.log();
      console.log(chalk.gray('Or install lerian-protocol in a standard location:'));
      console.log(chalk.gray('   ~/Documents/Lerian/ai-prompts'));
      console.log(chalk.gray('   ~/lerian-protocol'));
      process.exit(1);
    }
    
    console.log(chalk.green(`✅ Found Lerian Protocol at: ${destPath}`));
  } else {
    destPath = path.resolve(destPath);
  }

  // Validate paths
  if (!await fs.pathExists(sourcePath)) {
    console.error(chalk.red(`❌ Error: Source path does not exist: ${sourcePath}`));
    process.exit(1);
  }

  if (!await fs.pathExists(destPath)) {
    console.error(chalk.red(`❌ Error: Destination path does not exist: ${destPath}`));
    process.exit(1);
  }

  // Check if destination is actually lerian-protocol
  try {
    const destPackagePath = path.join(destPath, 'package.json');
    if (await fs.pathExists(destPackagePath)) {
      const destPackage = await fs.readJson(destPackagePath);
      if (destPackage.name !== 'lerian-protocol') {
        console.log(chalk.yellow('⚠️  Warning: Destination does not appear to be lerian-protocol'));
        console.log(chalk.gray(`   Found package: ${destPackage.name}`));
      }
    }
  } catch {
    // Continue anyway
  }

  console.log(chalk.gray(`Source: ${sourcePath}`));
  console.log(chalk.gray(`Destination: ${destPath}`));
  console.log();

  // Configure sync options
  const syncOptions = {
    includeDirectories: options.include || ['.claude', 'protocol-assets'],
    excludePatterns: options.exclude || [
      'node_modules/**',
      '.git/**',
      '.DS_Store',
      '*.log',
      'coverage/**',
      'dist/**',
      'build/**'
    ],
    enableInteractiveMode: options.interactive,
    autoSelectNew: options.autoNew || false,
    autoSelectModified: options.autoModified || false,
    dryRun: options.dryRun || false
  };

  // Show configuration
  if (options.dryRun) {
    console.log(chalk.yellow('🔍 Dry run mode - no files will be modified'));
  }

  if (options.interactive) {
    console.log(chalk.blue('🎯 Interactive mode - you\'ll select which files to sync'));
  } else {
    console.log(chalk.blue('🤖 Auto mode - files will be selected automatically'));
  }

  console.log(chalk.gray(`Include: ${syncOptions.includeDirectories.join(', ')}`));
  console.log(chalk.gray(`Exclude: ${syncOptions.excludePatterns.join(', ')}`));
  console.log();

  try {
    // Initialize sync
    const sync = new InteractiveSync(sourcePath, destPath, syncOptions);

    // Set up event handlers
    sync.on('detection:start', () => {
      console.log(chalk.gray('🔍 Scanning for changes...'));
    });

    sync.on('detection:complete', (changes) => {
      if (changes.length === 0) {
        console.log(chalk.green('✅ No changes detected - everything is in sync!'));
        return;
      }

      console.log(chalk.green(`✅ Found ${changes.length} changes:`));
      
      // Group changes by type
      const changeTypes = {
        new: changes.filter(c => c.changeType === 'new').length,
        modified: changes.filter(c => c.changeType === 'modified').length,
        deleted: changes.filter(c => c.changeType === 'deleted').length,
        moved: changes.filter(c => c.changeType === 'moved').length
      };

      Object.entries(changeTypes).forEach(([type, count]) => {
        if (count > 0) {
          const icon = getChangeIcon(type);
          console.log(chalk.gray(`   ${icon} ${count} ${type} files`));
        }
      });
      console.log();

      if (options.interactive) {
        console.log(chalk.blue('🎯 Opening interactive file selector...'));
        console.log(chalk.gray('Use arrow keys to navigate, Space to toggle, Enter to confirm'));
        console.log();
      }
    });

    sync.on('selection:complete', (selectedFiles) => {
      if (selectedFiles.length === 0) {
        console.log(chalk.yellow('ℹ️  No files selected - sync cancelled'));
        return;
      }

      console.log(chalk.green(`📋 Selected ${selectedFiles.length} files for sync:`));
      selectedFiles.slice(0, 10).forEach(file => {
        const icon = getChangeIcon(file.changeType);
        console.log(chalk.gray(`   ${icon} ${file.path}`));
      });

      if (selectedFiles.length > 10) {
        console.log(chalk.gray(`   ... and ${selectedFiles.length - 10} more files`));
      }
      console.log();

      if (!options.dryRun) {
        console.log(chalk.blue('🚀 Starting sync...'));
      }
    });

    sync.on('sync:progress', (progress) => {
      if (progress.current % 5 === 0 || progress.current === progress.total) {
        console.log(chalk.gray(`   Syncing... ${progress.current}/${progress.total}`));
      }
    });

    sync.on('sync:complete', (results) => {
      console.log();
      console.log(chalk.green('🎉 Sync completed successfully!'));
      
      if (results.synced > 0) {
        console.log(chalk.green(`   ✅ Synced: ${results.synced} files`));
      }
      if (results.skipped > 0) {
        console.log(chalk.yellow(`   ⏭️  Skipped: ${results.skipped} files`));
      }
      if (results.errors > 0) {
        console.log(chalk.red(`   ❌ Errors: ${results.errors} files`));
      }

      console.log();
      console.log(chalk.gray('💡 Tip: Use --dry-run to preview changes without syncing'));
    });

    sync.on('error', (error) => {
      console.error(chalk.red(`❌ Sync error: ${error.message}`));
    });

    // Run the sync
    await sync.run();

  } catch (error) {
    if (error.message.includes('User cancelled')) {
      console.log(chalk.yellow('ℹ️  Sync cancelled by user'));
      process.exit(0);
    }
    throw error;
  }
}

function getChangeIcon(changeType) {
  const icons = {
    new: '🆕',
    modified: '📝',
    deleted: '🗑️',
    moved: '🔀'
  };
  return icons[changeType] || '❓';
}

module.exports = { runSync };