const inquirer = require('inquirer')
const chalk = require('chalk')

async function selectFiles(changes) {
  const choices = [
    ...changes.new.map(file => ({
      name: `${chalk.green('[NEW]')} ${file.displayPath}`,
      value: file.displayPath,
      checked: false
    })),
    ...changes.modified.map(file => ({
      name: `${chalk.yellow('[MODIFIED]')} ${file.displayPath}`,
      value: file.displayPath,
      checked: false
    }))
  ]

  if (choices.length === 0) {
    console.log(chalk.yellow('📭 No changes detected to sync.'))
    return []
  }

  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedFiles',
      message: '📁 Select files to sync back to lerian-protocol source:',
      choices,
      validate: (input) => {
        if (input.length === 0) {
          return 'Please select at least one file or press Ctrl+C to cancel'
        }
        return true
      }
    }
  ])

  return answers.selectedFiles
}

/**
 * Simplified progress display
 */
function showProgress(message) {
  console.log(chalk.cyan(`🔄 ${message}`))
}

/**
 * Display results
 */
function displayResults(results) {
  console.log('')
  if (results.dryRun) {
    console.log(chalk.cyan.bold('🔍 Dry Run Results:'))
  } else {
    console.log(chalk.green.bold('✅ Sync Complete!'))
  }
  console.log('')
  
  results.synced.forEach(file => {
    const icon = file.type === 'new' ? '➕' : '🔄'
    const action = results.dryRun ? 'would sync' : 'synced'
    console.log(`${icon} ${chalk.green(file.displayPath)} (${action})`)
  })
  
  if (results.errors && results.errors.length > 0) {
    results.errors.forEach(error => {
      console.log(`❌ ${chalk.red(error.displayPath)}: ${error.error}`)
    })
  }
}

module.exports = {
  selectFiles,
  showProgress,
  displayResults
}