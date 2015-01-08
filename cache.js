'use strict';
var async    = require('async')
  , fs       = require('fs')
  , log      = require('magic-log')
  , utils    = require('magic-utils')
  , path     = require('path')
;


function prepareGetHosts(cb) {
  cb(null, path.join(process.cwd(), 'hosts'));
}

function filterByBlogDir(hosts, cb) {
  utils.each(hosts, function (host, key) {
    hosts[key] = path.join(host, 'views', 'blog');
  });
  async.filter(hosts, fs.exists, function (filteredHosts) {
    cb(null, filteredHosts);
  });
}

function getHostsWithBlog(cb) {
  async.waterfall([
      prepareGetHosts
    , utils.findSubDirectories
    , filterByBlogDir
  ]
  , cb);
}

function getArchives(dir, cb) {
  utils.findSubDirectories(dir, function (err, subFiles) {
    utils.each(subFiles, function (subFilePath, key) {
      var fileArray = subFilePath.split('/')
        , num       = fileArray[fileArray.length -1]
      ;
      if ( ! parseInt(num) ) {
        delete subFiles[key];
      } else {
        subFiles[key] = {
            dir: subFilePath
          , num: num
        };
      }
      cb(null, subFiles);
    });
  });
}

function getYearlyArchives(host, cb) {
  getArchives(host, cb);
}

function getMonthlyArchives(year, cb) {
  getArchives(year.dir, cb);
}

function getBlogPosts(month, cb) {
  console.log('magic-cache', 'getBlogPosts called with month', month);
  utils.findSubFiles(month.dir, cb);
}

function cleanString(string, splitter) {
  if ( splitter ) { 
    return string.replace(new RegExp(splitter, 'g'), '')
                 .trim();
  }

  return string.replace(/'/g, '')
               .replace(/"/g, '')
               .trim();
}

function parsePost(post, cb) {
  fs.readFile(post, function (err, content) {
    var lines = content.toString().split('\n')
      , values = {}
    ;
    utils.each(lines, function (line, key) {
      if ( line.indexOf('- var') >= 0 && line.indexOf('=') >= 0 ) {
        var lineArray = line.split('=')
          , name      = lineArray[0].replace('- var', '').trim()
          , val       = lineArray[1].replace(new RegExp(';', 'g'), '').trim()
          , splitter  = ( val.indexOf("'") === 0 ) ? "'" : false
        ;
        if ( val.indexOf('"') === 0 ) {
          splitter = '"';
        }
        if ( splitter === '"' || splitter === "'" ) {
          //it's supposed to be a string
          values[name] = cleanString(val, splitter);
        } else if ( val.indexOf('[') === 0 ) {
          let array = [];
          //supposed to be an array
          val = val.replace(/\[/g, '')
                   .replace(/\]/g, '')
                   .trim()
                   .split(',')
          ;
          utils.each(val, function (v, key) {
            array[key] = cleanString(v);
          });
          values[name] = array;
        } else if ( val.indexOf('{') === 0 ) {
          val = val.replace(/{/g, '')
                   .replace(/}/g, '')
                   .split(',');
          var object = {};
          utils.each(val, function (v) {
            var vArray = v.replace(/"/g, "'")
                          .replace(/:*'/g, ":'")
                          .split(":'")
              , vName  = cleanString(vArray[0].replace(':', ''))
              , vVal   = cleanString(vArray[1])
            ;
            object[vName] = vVal;
          });
        } else {
          //~ log.error('magic-cache', 'blogPost:', post, 'variable type missing, line:', line); 
        }
      }
    });
    //~ console.log('values after parsePost = ', values);
    cb(null, post);
  });
}

function getFullArchive(host, cb) {
  log('magic-cache', 'getFullArchive called', 'host', host);
  var archives = {};
  getYearlyArchives(host, function (err, years) {
    if ( err ) { throw err; }
    //~ log('magic-cache', 'yearly Archive years', years);
    async.each(years, function (year, yearcb) {
      archives[year.num] = {
          dir   : year.dir
        , months: {}
      };
      getMonthlyArchives(year, function (err, months) {
        if ( err ) { throw err; }
        //~ console.log('magic-cache', 'months', months);
        async.each(months, function (month, monthcb) {
          archives[year.num].months[month.num] = {
              dir  : month.dir
            , posts: {}
          };
          
          console.log('magic-cache', 'loading blogPosts for month', month);
          getBlogPosts(month, function (err, posts) {
            if ( err ) { throw err; }
            //~ log('magic-cache', 'getBlogPosts found blog posts', posts);
            async.each(posts, function (post, postcb) {
              parsePost(post, function (err, post) {
                
                archives[year.num].months[month.num].posts[post.slug] = {
                    dir  : post.dir
                  , posts: {}
                };
              });
            });
          });
        });
      });
    }, cb);
  });
}

function getBlogMeta(hosts, cb) {
  console.log('hosts in getBlogMeta', hosts);
  async.each( hosts, getFullArchive, function (err, filteredHosts) {
    log('magic-cache', 'filteredHosts', filteredHosts);
  });

}


function init() {
  async.waterfall([
      getHostsWithBlog
    , getBlogMeta
  ]
  , function (err, results) {
    if ( err ) { log.error('magic-cache', err); }
    log('magic-blog', 'results of getSubDirectories', results);
  });
}

init();
