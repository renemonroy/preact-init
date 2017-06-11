'use strict';

const chalk = require('chalk');

const command = chalk.green('preact-init');
const firstArg = chalk.yellow('<project-name>');
const secondArg = chalk.yellow('<template-repo>');
const options = chalk.yellow('[options]');

module.exports = (version) => {
  console.log(
`\npreact-init v${version}
-------------------------------------

Usage: ${command} ${firstArg} ${secondArg} ${options}`
  );
};
