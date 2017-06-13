'use strict';

const chalk = require('chalk');
const childProcess = require('child_process');
const dirTree = require('directory-tree');
const downloadGitRepo = require('download-git-repo');
const fs = require('fs-extra');
const isSubset = require('obj-subset');
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
    const directory = path.resolve('', name);
    fs.ensureDir(directory, (err) => {
      if (err) {
        console.log(err);
        reject(new Error(`The directory ${directory} wasn't created.`));
      } else {
        if (!isSafeToCreateAppIn(directory)) {
          reject(new Error(`The directory ${chalk.white(name)} contains files that could conflict. Try a dfferent name.`));
        }
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
    downloadGitRepo(repo, destination, { clone }, (err) => {
      if (err) {
        console.log(err);
        reject(new Error(`Failed to download template from ${repo}`));
      } else {
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
    const templateTree = dirTree(directory);
    if (!isValidTemplateTree(templateTree)) {
      fs.removeSync(directory);
      throw new Error('Directory structure does not match template\'s tree requirements.');
    }
    resolve(directory);
  })
);

/**
 * Updates package.json with project's data
 * ------------------------------------------------------------- */
const updatePackage = (directory, { name }) => (
  new Promise((resolve) => {
    const pkg = path.resolve(directory, './package.json');
    let pkgData = null;
    if (!fs.existsSync(pkg)) {
      throw new Error(`A package.json does not exist at ${directory}.`);
    }
    pkgData = orderByKey(Object.assign({}, initialPackage, fs.readJsonSync(pkg), { name }));
    fs.writeFileSync(pkg, JSON.stringify(pkgData, null, 2));
    resolve(directory);
  })
);

/**
 * Install dependencies specified in package.json
 * ------------------------------------------------------------- */
const installDependencies = (directory) => (
  new Promise((resolve, reject) => {
    const proc = childProcess.spawn('npm', ['install', '--silent'], {
      shell: true,
      cwd: path.resolve(directory, '.'),
      stdio: 'inherit',
    });
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error('Installation process failed.'));
      } else {
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
    .then((config) => { c = config; return createDirectory(c.name); })
    .then((directory) => downloadTemplate(c.template, directory, c.options.ssh))
    .then((directory) => validateTemplate(directory))
    .then((directory) => updatePackage(directory, c))
    .then((directory) => installDependencies(directory))
    .then(() => {
      console.log('Success!');
      process.exit();
    })
    .catch(endWithError);
};
