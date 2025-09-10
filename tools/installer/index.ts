import Installer from './installer'
import { theme, SpinnerManager, output } from './ui-theme'
import { debug } from './debug'
import { DEFAULTS } from './constants'

// Create a default installer instance and export its methods directly
const installerInstance = new Installer()

interface InstallerModule {
  Installer: typeof Installer
  theme: typeof theme
  SpinnerManager: typeof SpinnerManager
  output: typeof output
  debug: typeof debug
  DEFAULTS: typeof DEFAULTS
  installer: Installer
  install: typeof installerInstance.install
  status: typeof installerInstance.status
  uninstall: typeof installerInstance.uninstall
  update: typeof installerInstance.update
}

const installerModule: InstallerModule = {
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

export = installerModule
