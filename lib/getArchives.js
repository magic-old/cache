'use strict';

var utils = require('magic-utils')
  , log   = require('magic-log')
  , async = require('async')
;

module.exports = function getArchives(dir, cb) {
  log('getArchives in dir', dir);
  utils.findSubDirectories(dir, function (err, files) {
    async.map(files, function (filePath, mapCb) {
      var fileArray = filePath.split('/')
        , num       = fileArray[fileArray.length -1]
      ;
      if ( ! parseInt(num) ) {
        return mapCb();
      }
      
      var file = { 
          dir: filePath
        , num: num
      };
      log('returning file', file);
      mapCb(null, file);
    }, cb);
  });
}
