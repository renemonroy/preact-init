'use strict';

const minimist = require('minimist');

const init = require('../lib/init');
const { showHelp, showVersion } = require('../lib/interactions');

const minimistConfig = {
  boolean: ['ssh'],
  default: {
    ssh: false,
  },
  alias: {
    h: 'help',
    v: 'version',
    s: 'ssh',
  },
};

const command = minimist(process.argv.slice(2), minimistConfig);
const config = {};

config.options = Object.assign({}, command);

delete config.options['_'];
Object.keys(minimistConfig.alias).forEach((key) => {
  delete config.options[key];
});

switch (command['_'].length) {
  case 0:
    break;
  case 1:
    config.name = command['_'][0];
    break;
  case 2:
    config.name = command['_'][0];
    config.template = command['_'][1];
    break;
  default:
    showHelp();
}

if (config.help) {
  return showHelp();
} else if (config.version) {
  return showVersion();
}

init(config);
