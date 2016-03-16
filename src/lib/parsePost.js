import fs from 'fs';
import log from 'magic-server-log';
import { slugify } from 'magic-strings';

const noop = () => {};

const cleanString =
  (string, splitter) =>
    splitter
      ? string.replace(new RegExp(splitter, 'g'), '')
              .trim()
      : string.replace(/'/g, '')
              .replace(/"/g, '')
              .trim();

const parsePost =
  (file, cb = noop) => {
    fs.readFile(file, (err, content) => {
      if (err) {
        throw err;
      }

      const lines = content.toString().split('\n');
      const filenameArray = file.split('/');
      const post = {
        filename: filenameArray[filenameArray.length - 1],
      };

      lines.forEach(
        (line) => {
          if (line.indexOf('- var') >= 0 && line.indexOf('=') >= 0) {
            const lineArray = line.split('=');
            const name = lineArray[0].replace('- var', '').trim();
            let val = lineArray[1].replace(new RegExp(';', 'g'), '').trim();
            const firstChar = val.substr(0, 1);

            const splitter =
              firstChar === '"' || firstChar === "'"
              ? firstChar
              : false;

            if (splitter === '"' || splitter === "'") {
              // it's supposed to be a string
              post[name] = cleanString(val, splitter);
            } else if (val.indexOf('[') === 0) {
              const postArray = [];

              // supposed to be an array
              val = val.replace(/\[/g, '')
                       .replace(/\]/g, '')
                       .trim()
                       .split(',');

              Object.keys(val).forEach(
                key => {
                  postArray[key] = cleanString(val[key]);
                }
              );

              post[name] = postArray;
            } else if (val.indexOf('{') === 0) {
              val = val.replace(/{/g, '')
                       .replace(/}/g, '')
                       .split(',');

              const postObject = {};

              val.forEach(
                (v) => {
                  const vArray = v.replace(/"/g, "'")
                                .replace(/:*'/g, ":'")
                                .split(":'");

                  const vName = cleanString(vArray[0].replace(':', ''));

                  postObject[vName] = cleanString(vArray[1]);
                });

              post[name] = postObject;
            } else {
              log.error(`magic-cache blogPost file: ${file} variable type not understood, line: ${line}`);
            }
          }
        });

      if (post.title && !post.slug) {
        post.slug = slugify(post.title);
      }

      // ~ post.content = content.toString();
      // ~ console.log('magic-cache', 'lib/parsePost', 'returning post', post);

      cb(null, post);
    });
  };

export default parsePost;
