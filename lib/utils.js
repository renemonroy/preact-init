'use strict';

const chalk = require('chalk');
const { version } = require('../package.json');

// Prints version of preact-init
module.exports.showVersion = () => {
  console.log(`v${version}`);
  process.exit(0);
};

// Prints helpful information about preact-init
module.exports.showHelp = () => {
  const command = chalk.green('preact-init');
  const firstArg = chalk.yellow('<project-name>');
  const secondArg = chalk.yellow('<template-repo>');
  const options = chalk.yellow('[options]');
  console.log(
`\npreact-init v${version}
-------------------------------------

Usage: ${command} ${firstArg} ${secondArg} ${options}`
  );
  process.exit(0);
};
