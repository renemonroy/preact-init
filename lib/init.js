'use strict';

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const downloadGitRepo = require('download-git-repo');

const { assist, confirm, } = require('./interactions');
const { endWithError } = require('./utils');

const defaults = {
  name: 'my-project',
  template: 'github:churris/preact-simple-template',
};

const validFiles = [
  '.DS_Store',
  'Thumbs.db',
  '.git',
  '.gitignore',
  '.idea',
  'README.md',
  'LICENSE',
  'web.iml'
];

/**
 * Check for files that can be ignored
 * ------------------------------------------------- */
const isSafeToCreateAppIn = (directory) => (
  fs.readdirSync(directory).every(file => (
		validFiles.indexOf(file) >= 0
	))
);

/**
 * Assist if a config is not valid
 * ------------------------------------------------- */
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
 * Configure package.json with updated info
 * ------------------------------------------------- */
const configurePackage = (data, name) => (
  Object.assign({}, data, {
    name,
		version: '0.1.0',
		private: true,
		scripts: {
			start: 'preact-utils run',
			build: 'preact-utils build',
		},
    dependencies: {
      'preact': '^8.1.0',
      'preact-compat': '^3.16.0',
    },
    devDependencies: {
     'preact-utils': '*',
    }
  })
);

/**
 * Creates the project's directory
 * ------------------------------------------------- */
const createDirectory = (name) => (
  new Promise((resolve, reject) => {
    const directory = path.resolve('', name);
    fs.ensureDir(directory, (err) => {
      if (err) {
        console.log(err);
        reject(new Error(`The directory ${directory} wasn't created.`));
      } else {
        if (!isSafeToCreateAppIn(directory)) {
          reject(new Error(`The directory ${chalk.white(name)} contains files that could conflict.\nTry a dfferent name.`));
        }
        resolve(directory);
      }
    });
  })
);

/**
 * Clones a template from a git repository
 * ------------------------------------------------- */
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
 * Create package.json for the new app
 * ------------------------------------------------- */
const createPackage = (directory, config) => (
  new Promise((resolve) => {
    const pkg = path.resolve(directory, './package.json');
    let pkgData = null;
    if (!fs.existsSync(pkg)) {
      throw new Error(`A package.json does not exist at ${directory}.`);
    }
    pkgData = configurePackage(JSON.parse(fs.readFileSync(pkg, 'utf8')), config.name);
    fs.writeFileSync(pkg, JSON.stringify(pkgData, null, 2));
    resolve(pkgData);
  })
);


/**
 * name method to initialize a Preact project
 * ------------------------------------------------- */
module.exports = (initialConfig) => {
  let c = null;
  Promise.resolve()
    .then(() => ensureConfig(initialConfig))
    .then((config) => confirm(JSON.stringify(Object.assign({}, defaults, config), null, '  ')))
    .then((config) => { c = config; return createDirectory(c.name); })
    .then((directory) => downloadTemplate(c.template, directory, c.options.ssh))
    .then((directory) => createPackage(directory, c))
    .then(() => {
      console.log('Success!');
      process.exit();
    })
    .catch(endWithError);
};
