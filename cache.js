#!/usr/bin/env node
'use strict';
var path     = require('path')
  , fs       = require('fs')
  , program  = require('commander')
  , log      = require('magic-log')
;

module.exports = function execute() {
  program.version('0.0.1');

  program
    .command('*')
    .description('test command')
    .action(function () {
      log('test command');
    })
  ;

  program.parse(process.argv);

  function printHelp() {
    console.log('help text');
  }
}
