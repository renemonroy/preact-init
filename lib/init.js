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
const { endWithError } = require('./utils');
const templateJson = require('../config/templates.json');

/**
 * Check for files that can be ignored
 * ------------------------------------------------------------- */
const isSafeToCreateAppIn = (directory) => (
  fs.readdirSync(directory).every(file => (
    templateJson.validFiles.indexOf(file) >= 0
  ))
);

/**
 * Validates the template tree of a directory
 * ------------------------------------------------------------- */
const isValidTemplateTree = templateTree => (
  isSubset(templateTree, templateJson.requiredTree)
);

/**
 * Validates minimum requirements of a template package
 * ------------------------------------------------------------- */
const isValidTemplatePackage = templatePackage => (
  isSubset(templatePackage, templateJson.validPackage)
);

/**
 * Validates minimum dependencies of the template
 * ------------------------------------------------------------- */
const hasValidDependencies = (templatePackage, depName) => (
  templateJson[depName].every(dep => dep in templatePackage[depName])
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
    const spinner = ora(`[1/4] Create project's directory`).start();
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
    const spinner = ora('[2/4] Cloning template from a Git repository...').start();
    downloadGitRepo(repo, destination, { clone }, (err) => {
      spinner.text = '[2/4] Clone template from Git repo';
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
    const spinner = ora('[3/4] Validate downloaded template').start();
    const templateTree = dirTree(directory);
    const pkg = path.resolve(directory, 'package.json');
    const pkgData = fs.readJsonSync(pkg);
    const validationFailed = (msg) => {
      spinner.fail();
      fs.removeSync(directory);
      throw new Error(msg);
    };
    if (!isValidTemplateTree(templateTree)) {
      validationFailed('Directory structure does not match template\'s tree requirements.');
    }
    if (!isValidTemplatePackage(pkgData)) {
      validationFailed('Template\'s package does not meet the minimum requirements.');
    }
    if (!hasValidDependencies(pkgData, 'dependencies') || !hasValidDependencies(pkgData, 'devDependencies')) {
      validationFailed('Template does not have valid dependencies.')
    }
    spinner.succeed();
    resolve(directory);
  })
);

/**
 * Install dependencies specified in package.json
 * ------------------------------------------------------------- */
const installDependencies = (directory, { name }) => (
  new Promise((resolve, reject) => {
    const spinner = ora('[4/4] Installing dependencies from NPM...').start();
    const cwd = path.resolve(directory, '.');
    const pkg = path.resolve(cwd, 'package.json');
    const pkgData = fs.readJSONSync(pkg);
    pkgData.name = name;
    fs.writeFile(pkg, JSON.stringify(pkgData, null, 2), () => {
      const proc = childProcess.spawn('npm', ['install'], {
        shell: true,
        cwd: cwd,
        stdio: 'ignore',
      });
      proc.on('close', (code) => {
        spinner.text = '[4/4] Install NPM dependencies';
        if (code !== 0) {
          spinner.fail();
          reject(new Error('Installation process failed.'));
        } else {
          spinner.succeed();
          resolve(directory);
        }
      });
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
    .then((directory) => installDependencies(directory, c))
    .then((directory) => {
      console.log();
      console.log(`Success!`);
      console.log();
      console.log(`You can run the following commands from this directory:\n${chalk.yellow(directory)}`);
      console.log();
      console.log(` ${chalk.cyan('npm start')}       Runs the dev server with hot reload`);
      console.log(` ${chalk.cyan('npm run build')}   Bundles your project into static files`);
      console.log();
      process.exit();
    })
    .catch(endWithError);
};
