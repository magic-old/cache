'use strict';
var async         = require('async')
  , fs            = require('fs')
  , log           =  require('magic-log')
  , utils         = require('magic-utils')
  , path          = require('path')
  , parsePost     = require('./lib/parsePost')
  , getHosts      = require('./lib/getHosts')
  , getArchives   = require('./lib/getArchives')
  , saveBlogIndex = require('./lib/saveBlogIndex')
;

function getYearlyArchive(host, cb) {
  getArchives(host.dir, function (err, years) {
    if ( err ) { return cb(err); }
    //~ log('years', years);
    async.map(
      years
    , getMonthlyArchive
    , function (err, yearlyArchives) {
        //~ log('yearlyArchives', yearlyArchives);
        host.years = yearlyArchives;
        cb(err, host);
      }
    );
  });
}

function getMonthlyArchive(year, cb) {
  getArchives(year.dir, function (err, months) {
    if ( err ) { return cb(err); }
    //~ log('months', months);
    async.map(
      months
    , getBlogPosts
    , function (err, monthlyArchives) {
        //~ log('monthlyArchives', monthlyArchives);
        year.months = monthlyArchives;
        cb(err, year);
      }
    );
  });
}

function getBlogPosts(month, cb) {
  utils.findSubFiles(month.dir, function(err, files) {
    if ( err ) { throw err; }
    async.map(
      files 
    , parsePost
    , function (err, posts) {
        month.posts = posts;
        cb(err, month);
      }
    );
  });
}


function getBlogData(hosts, cb) {
  //~ log('magic-cache', 'getBlogData called with hosts', hosts);
  async.map(hosts, function (host, eachCb) {
    getYearlyArchive(host, eachCb)
  }
  , cb);
}


function init() {
  async.waterfall([
      getHosts
    , getBlogData
  ]
  , function (err, hosts) {
    if ( err ) { throw err; }
    var hostsAsObject = {};
    utils.each(hosts, function (host, cb) {
      hostsAsObject[host.name] = host;
    });
    saveBlogIndex(hostsAsObject, function (err) {
      if ( err ) { throw err; }
      log('saving hosts done, blogdata set');
    });
  });
}

init();
