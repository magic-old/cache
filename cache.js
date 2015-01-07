#!/usr/bin/env node
'use strict';
var path     = require('path')
  , fs       = require('fs')
  , program  = require('commander')
  , log      = require('magic-log')
  , builder  = require('./lib')
;

module.exports = function execute() {
  program.version('0.0.1');

  builder();
}
