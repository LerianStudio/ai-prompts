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
  installer: new Installer()
}