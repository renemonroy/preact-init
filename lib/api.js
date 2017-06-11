'use strict';

const chalk = require('chalk');

module.exports.init = (command) => {
  console.log('>>> command:', command);
};

module.exports.help = (version) => {
  const command = chalk.green('preact-init');
  const firstArg = chalk.yellow('<project-name>');
  const secondArg = chalk.yellow('<template-repo>');
  const options = chalk.yellow('[options]');
  console.log(
`\npreact-init v${version}
-------------------------------------

Usage: ${command} ${firstArg} ${secondArg} ${options}`
  );
};
