'use strict';

var fs   = require('fs')
  , path = require('path')
;

module.exports = function saveHost(hosts, cb) {
  var cwd = process.cwd();
  //~ console.log('saveHost called with hosts', hosts);
  var cacheDir      = path.join(cwd, '.cache')
    , blogIndexPath = path.join(cacheDir, 'blog.json')
  ;
  fs.mkdir(cacheDir, function (err) {
    //if the dir exists ignore the error
    if ( err && err.code && err.code !== 'EEXIST') { throw err; }
    fs.writeFile(blogIndexPath, JSON.stringify(hosts, null, 2), cb);
  });
}
