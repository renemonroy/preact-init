'use strict';

const chalk = require('chalk');
const validatePackageName = require('validate-npm-package-name');

/**
 * Cleans the terminal
 * ------------------------------------------------- */
module.exports.clearConsole = () => {
	process.stdout.write(
		process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H'
  );
};

/**
 * Ends a promise, used on catch errors
 * ------------------------------------------------- */
module.exports.endWithError = (err) => {
	console.log();
  console.log(`${chalk.red('>>')} ${err.message || err}`);
  process.exit(1);
};

/**
 * Validates the project's name
 * ------------------------------------------------- */
module.exports.isValidAppName = (name) => {
	const its = validatePackageName(name);
	if (!its.validForNewPackages) {
		const errors = (its.errors || []).concat(its.warnings || []);
		return `Sorry, ${errors.join(' and ')} .`;
	}
	return true;
};

/**
 * Returns a new object with ordered keys
 * ------------------------------------------------- */
module.exports.orderByKey = (obj) => {
  const newObj = {};
  Object.keys(obj).sort().forEach((key) => {
    newObj[key] = obj[key];
  });
	return newObj;
};
