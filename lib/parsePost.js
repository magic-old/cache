'use strict';

var fs    = require('fs')
  , log   = require('magic-log')
  , utils = require('magic-utils')
;


function cleanString(string, splitter) {
  if ( splitter ) { 
    return string.replace(new RegExp(splitter, 'g'), '')
                 .trim();
  }

  return string.replace(/'/g, '')
               .replace(/"/g, '')
               .trim();
}

module.exports = function parsePost(file, cb) {
  //~ log('parsePost called for file', file);
  fs.readFile(file, function (err, content) {
    var lines = content.toString().split('\n')
      , post = {}
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
          post[name] = cleanString(val, splitter);
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
          post[name] = array;
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
          post[name] = object;
        } else {
          log.error('magic-cache', 'blogPost file:', file, 'variable type not understood, line:', line); 
        }
      }
    });
    if ( post.title && ! post.slug ) {
      post.slug = utils.slugify(post.title);
    }
    post.content = content.toString();
    //~ console.log('magic-cache', 'lib/parsePost', 'returning post', post);
    cb(null, post);
  });
}
