'use strict';

var async = require('async')
  , fs    = require('fs')
  , path  = require('path')
;

function saveFile(filePath, data, cb) {
  fs.writeFile(filePath, JSON.stringify(hosts, null, 2), cb);
}

module.exports = function saveHost(hosts, cb) {
  var cwd = process.cwd()
    , cacheDir      = path.join(cwd, '.cache')
    , filePath = path.join(cacheDir)
  ;
  fs.mkdir(cacheDir, function (err) {
    //if the dir exists ignore the error
    if ( err && err.code && err.code !== 'EEXIST') { throw err; }

    async.each(hosts, function (host, key) {
      saveFile(path.join(filePath, key + '.json'), JSON.stringify(host, null, 2), cb);
    }, cb);
  });
}
