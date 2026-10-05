const path = require('path');
const pkg = require('../package.json');
const library = require('../react-native.config.js');

module.exports = {
  dependencies: {
    [pkg.name]: {
      root: path.join(__dirname, '..'),
      platforms: {
        ios: {},
        android: library.dependency.platforms.android,
      },
    },
  },
};
