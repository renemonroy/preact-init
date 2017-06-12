'use strict';

const minimist = require('minimist');

const { version } = require('../package.json');
const { init, help } = require('./api');

const command = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
    v: 'version',
  },
});

if (command.help) {
  help(version);
} else if (command.version) {
  console.log(`v${version}`);
} else {
  init(command);
}
