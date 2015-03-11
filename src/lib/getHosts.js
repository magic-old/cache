'use strict';
var async = require('async')
  , fs    = require('fs')
  , utils = require('magic-utils')
  , path  = require('path')
;

function prepareGetHosts(cb) {
  var hostPath = path.join(process.cwd(), 'hosts');
  cb(null, hostPath);
}

function filterByBlogDir(hosts, cb) {

  async.map(hosts, function (host, mapCb) {
    var hostArr       = host.split('/')
      , hostName      = hostArr[hostArr.length - 1]
      , hostDir       = path.join(host, 'views', 'blog')
      , filteredHosts = {}
    ;

    fs.exists(hostDir, function (exists) {
      var host = null;
      if ( exists ) {
        host = {
            dir : hostDir
          , years: {}
          , name : hostName
        };
        return mapCb(null, host);
      }
      mapCb();
    });
  }, function (err, hosts) {
    var filteredHosts = [];
    if ( err ) { return cb(err); }
    utils.each(hosts, function (host, key) {
      if ( host ) {
        filteredHosts.push({
          dir: host.dir
        , name: host.name
        });
      }
    });
    cb(null, filteredHosts);
  });
}

module.exports = function getHostsWithBlog(cb) {
  async.waterfall([
      prepareGetHosts
    , utils.findSubDirectories
    , filterByBlogDir
  ]
  , cb);
}
