#!/usr/bin/env node
'use strict';

var semver = process.versions.node.split('.');

if (semver[0] < 6) {
  throw new Error('Preact Init requires Node v6 or higher.');
}

require('./preact-init');
