import {map, waterfall} from 'async';
import saveHosts  from './lib/saveHosts';
import parsePost from './lib/parsePost';
import getHosts from './lib/getHosts';
import getArchives from './lib/getArchives';

var fs          = require('fs')
  , log         =  require('magic-log')
  , utils       = require('magic-utils')
  , path        = require('path')
  , monthNames  = [
      'January'
    , 'February'
    , 'March'
    , 'April'
    , 'May'
    , 'June'
    , 'July'
    , 'August'
    , 'September'
    , 'October'
    , 'November'
    , 'December'
  ]
;

function getYearlyArchive(host, cb) {
  getArchives(host.dir, function (err, years) {
    if ( err ) { return cb(err); }
    //~ log(`years: ${years}`);
    map(
      years
    , getMonthlyArchive
    , function (err, yearlyArchives) {
        //~ log(`magic-cache: yearlyArchives: ${yearlyArchives}`);
        host.years = yearlyArchives;
        cb(err, host);
      }
    );
  });
}

function getMonthlyArchive(year, cb) {
  getArchives(year.dir, function (err, months) {
    if ( err ) { return cb(err); }
    //~ log(`magic-cache: months: ${JSON.stringify{months}`);
    map(
      months
    , getBlogPosts
    , function (err, monthlyArchives) {
        //~ log(`magic-cache: monthlyArchives: ${JSON.stringify(monthlyArchives)}`);
        year.months = monthlyArchives;
        cb(err, year);
      }
    );
  });
}

function getBlogPosts(month, cb) {
  utils.findSubFiles(month.dir, function(err, files) {
    if ( err ) { throw err; }
    map(
      files 
    , parsePost
    , function (err, posts) {
        month.posts = posts;
        month.name = monthNames[month.num - 1];
        cb(err, month);
      }
    );
  });
}
function getBlogData(hosts, cb) {
  //~ log(`magic-cache: getBlogData called with hosts ${JSON.stringify(hosts)}`);
  map(hosts, getYearlyArchive, cb);
}

function init() {
  waterfall([
      getHosts
    , getBlogData
  ]
  , function (err, hosts) {
    if ( err ) { throw err; }
    log(`pre host save, hostsAsObject: ${hosts}`);
    saveHosts(hosts, function (err) {
      if ( err ) { throw err; }
      log('saving hosts done, blogdata set.');
    });
  });
}

init();
