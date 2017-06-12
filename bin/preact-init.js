#!/usr/bin/env node
'use strict';

const minimist = require('minimist');

const init = require('../lib/init');
const { showHelp, showVersion } = require('../lib/utils');

const command = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
    v: 'version',
  },
});

const config = Object.assign({
  name: 'my-project',
  repository: 'https://github.com/churris/preact-simple-template.git',
}, command);
delete config['_'];

switch (command['_'].length) {
  case 0:
    break;
  case 1:
    config.name = command['_'][0];
    break;
  case 2:
    config.name = command['_'][0];
    config.repository = command['_'][1];
    break;
  default:
    showHelp();
}

if (config.help) {
  showHelp();
} else if (config.version) {
  showVersion();
} else {
  init(config);
}
