'use strict';

const chalk = require('chalk');
const inquirer = require('inquirer');

const { clearConsole, isValidAppName } = require('./utils');
const { version } = require('../package.json');
const defaults = require('../config/defaults.json');

/**
 * Prints version of preact-init
 * ------------------------------------------------- */
module.exports.showVersion = () => {
  console.log(`v${version}`);
  process.exit();
};

/**
 * Prints helpful information about preact-init
 * ------------------------------------------------- */
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
  process.exit();
};

/**
 * Prompts an object confirmation
 * ------------------------------------------------- */
module.exports.confirm = (obj) => {
  console.log();
  console.log(obj);
  console.log();
  return inquirer
    .prompt([{
      type: 'confirm',
      name: 'confirm',
      message: `${chalk.green('Is this ok?')}`,
      default: true,
    }])
    .then((answers) => {
      if (answers.confirm === true) {
        return JSON.parse(obj);
      }
      throw new Error('Aborted.');
    });
};

/**
 * Assist to init a new project
 * ------------------------------------------------- */
module.exports.assist = (config) => (
  new Promise((resolve) => {
    clearConsole();
    console.log('This utility will walk you through creating the initial files of your project.');
    console.log('The name of the project must follow NPM\'s naming pattern.');
    console.log();
    console.log('Press ^C at any time to quit.');
    console.log();
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'name',
          message: `${chalk.green('Project\'s Name:')}`,
          default: defaults.name,
          validate: isValidAppName,
        },
        {
          type: 'input',
          name: 'template',
          message: `${chalk.green('Template\'s repo:')}`,
          default: defaults.template, 
        },
        {
          type: 'confirm',
          name: 'options.ssh',
          message: `${chalk.green('Clone with SSH?')}`,
          default: defaults.options.ssh,
        }
      ])
      .then((answers) => {
        resolve(Object.assign({}, config, answers));
      });
  })
);

