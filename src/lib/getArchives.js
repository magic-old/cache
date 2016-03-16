import fsutils from 'magic-fs';
import async from 'async';

import { isNumber } from 'magic-types';

const noop = () => {};

export const getArchives =
  (dir, cb = noop) => {
    fsutils.findSubDirectories(dir, (err, files) => {
      if (err) {
        cb(err, files);
      }

      async.map(files, (dir, mapCb) => {
        const fileArray = dir.split('/');
        const num = fileArray[fileArray.length - 1];

        if (!isNumber(num)) {
          return mapCb();
        }

        const file = {
          dir,
          num,
        };

        mapCb(null, file);
      }, cb);
    });
  };

export default getArchives;
