// Main installer - delegates to the installer
const Installer = require('./installer/installer')

// Export the installer instance
module.exports = new Installer()