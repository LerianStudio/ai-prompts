// Installer modules index
// Provides access to all installer components

const UnifiedInstaller = require('./unified-installer')
const { theme, SpinnerManager, output } = require('./ui-theme')
const { debug } = require('./debug')
const { DEFAULTS } = require('./constants')

module.exports = {
  UnifiedInstaller,
  theme,
  SpinnerManager, 
  output,
  debug,
  DEFAULTS,
  // Export instance for compatibility
  installer: new UnifiedInstaller()
}