const Installer = require('./installer')
const { theme, SpinnerManager, output } = require('./ui-theme')
const { debug } = require('./debug')
const { DEFAULTS } = require('./constants')

// Create a default installer instance and export its methods directly
const installerInstance = new Installer()

module.exports = {
  Installer,
  theme,
  SpinnerManager,
  output,
  debug,
  DEFAULTS,
  installer: installerInstance,
  // Export installer methods directly for convenience
  install: installerInstance.install.bind(installerInstance),
  status: installerInstance.status.bind(installerInstance),
  uninstall: installerInstance.uninstall.bind(installerInstance),
  update: installerInstance.update.bind(installerInstance)
}
