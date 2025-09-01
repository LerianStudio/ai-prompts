// Installer modules index
// Provides access to all installer components

const Installer = require('./installer')
const { theme, SpinnerManager, output } = require('./ui-theme')
const { debug } = require('./debug')
const { DEFAULTS } = require('./constants')

module.exports = {
  Installer,
  theme,
  SpinnerManager, 
  output,
  debug,
  DEFAULTS,
  // Export instance for compatibility
  installer: new Installer()
}