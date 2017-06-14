'use strict';

const chalk = require('chalk');
const childProcess = require('child_process');
const dirTree = require('directory-tree');
const downloadGitRepo = require('download-git-repo');
const fs = require('fs-extra');
const isSubset = require('obj-subset');
const ora = require('ora');
const path = require('path');

const defaults = require('../config/defaults.json');
const { assist, confirm, } = require('./interactions');
const { endWithError, orderByKey } = require('./utils');
const { initialPackage, requiredTree, validFiles } = require('../config/templates.json');

/**
 * Check for files that can be ignored
 * ------------------------------------------------------------- */
const isSafeToCreateAppIn = (directory) => (
  fs.readdirSync(directory).every(file => (
		validFiles.indexOf(file) >= 0
	))
);

/**
 * Validates the template tree of a directory
 * ------------------------------------------------------------- */
const isValidTemplateTree = templateTree => (
  isSubset(templateTree, requiredTree)
);

/**
 * Assist if a config is not valid
 * ------------------------------------------------------------- */
const ensureConfig = (config) => (
  new Promise((resolve) => {
    if (!config.name && !config.template) {
      return assist(config)
        .then((newConfig) => {
          resolve(newConfig);
        });
    }
    resolve(config);
  })
);

/**
 * Creates the project's directory
 * ------------------------------------------------------------- */
const createDirectory = (name) => (
  new Promise((resolve, reject) => {
    console.log(`Initializing project: ${chalk.green(name)}`);
    console.log();
    const spinner = ora(`[1/5] Create project's directory`).start();
    const directory = path.resolve('', name);
    fs.ensureDir(directory, (err) => {
      if (err) {
        spinner.fail();
        console.log(err);
        return reject(new Error(`The directory ${directory} wasn't created.`));
      }
      if (!isSafeToCreateAppIn(directory)) {
        spinner.fail();
        return reject(new Error(`The directory ${chalk.white(name)} contains files that could conflict. Try a dfferent name.`));
      } else {
        spinner.succeed();
        resolve(directory);
      }
    });
  })
);

/**
 * Clones a template from a git repository
 * ------------------------------------------------------------- */
const downloadTemplate = (repo, destination, clone) => (
  new Promise((resolve, reject) => {
    const spinner = ora('[2/5] Clone template from a Git repository').start();
    downloadGitRepo(repo, destination, { clone }, (err) => {
      if (err) {
        spinner.fail();
        console.log(err);
        reject(new Error(`Failed to download template from ${repo}`));
      } else {
        spinner.succeed();
        resolve(destination);
      }
    });
  })
);

/**
 * Validates a downloaded template to continue
 * ------------------------------------------------------------- */
const validateTemplate = (directory) => (
  new Promise((resolve) => {
    const spinner = ora('[3/5] Validate downloaded template').start();
    const templateTree = dirTree(directory);
    if (!isValidTemplateTree(templateTree)) {
      spinner.fail();
      fs.removeSync(directory);
      throw new Error('Directory structure does not match template\'s tree requirements.');
    }
    spinner.succeed();
    resolve(directory);
  })
);

/**
 * Updates package.json with project's data
 * ------------------------------------------------------------- */
const updatePackage = (directory, { name }) => (
  new Promise((resolve) => {
    const spinner = ora('[4/5] Update project\'s package').start();
    const pkg = path.resolve(directory, './package.json');
    let pkgData = null;
    if (!fs.existsSync(pkg)) {
      spinner.fail();
      throw new Error(`A package.json does not exist at ${directory}.`);
    }
    pkgData = orderByKey(Object.assign({}, initialPackage, fs.readJsonSync(pkg), { name }));
    fs.writeFileSync(pkg, JSON.stringify(pkgData, null, 2));
    spinner.succeed();
    resolve(directory);
  })
);

/**
 * Install dependencies specified in package.json
 * ------------------------------------------------------------- */
const installDependencies = (directory) => (
  new Promise((resolve, reject) => {
    const spinner = ora('[5/5] Install dependencies from NPM').start();
    const proc = childProcess.spawn('npm', ['install'], {
      shell: true,
      cwd: path.resolve(directory, '.'),
      stdio: 'ignore',
    });
    proc.on('close', (code) => {
      if (code !== 0) {
        spinner.fail();
        reject(new Error('Installation process failed.'));
      } else {
        spinner.succeed();
        resolve(directory);
      }
    });
  })
);

/**
 * Main method to initialize a Preact project
 * ------------------------------------------------------------- */
module.exports = (initialConfig) => {
  let c = null;
  Promise.resolve()
    .then(() => ensureConfig(initialConfig))
    .then((config) => confirm(JSON.stringify(Object.assign({}, defaults, config), null, '  ')))
    .then((config) => { c = config; console.log(); return createDirectory(c.name); })
    .then((directory) => downloadTemplate(c.template, directory, c.options.ssh))
    .then((directory) => validateTemplate(directory))
    .then((directory) => updatePackage(directory, c))
    .then((directory) => installDependencies(directory))
    .then((directory) => {
      console.log();
      console.log(`Success!`);
      console.log();
      console.log(`Now you can run the following at ${chalk.yellow(directory)}`);
      console.log();
      console.log(` ${chalk.cyan('npm start')}       Runs the dev server with hot reload`);
      console.log(` ${chalk.cyan('npm run build')}   Bundles your project into static files`);
      process.exit();
    })
    .catch(endWithError);
};
