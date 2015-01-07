'use strict';
var async    = require('async')
  , express  = require('express')
  , fs       = require('fs')
  , log      = require('magic-log')
  , utils    = require('magic-utils')
  , path     = require('path')
  , cache    = {}
;

function prepareGetSubDirectories(cb) {
  cb(null, {});
}

function findSubDirectories(args, cb) {
  fs.readdir(cache.dir, function (err, files) {
    if ( err ) { cb(err); }
    args.files = files;
  });
  cb(null, args);
}
function filterSubDirectories(args, cb) {
  async.filter(args.files, utils.isDir, function(results) {
    args.files = results;
  });
}

function getSubDirectories(cb) {
  async.waterfall([
      prepareGetSubDirectories
    , findSubDirectories
    , filterSubDirectories
  ]
  , cb);
}

cache = function init(dir, cb) {
  cache.dir = dir;
  async.waterfall([
    getSubDirectories
  ]
  , function (err, results) {
    if ( err ) { log.error('magic-blog', err); }
    log('magic-blog', 'results of getSubDirectories', results);
  });
}

module.exports = cache;
