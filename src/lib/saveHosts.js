import async from 'async';
import fs from 'fs';
import path from 'path';

import { log } from 'magic-server-log';

const noop = () => {};

const saveFile =
  (filePath, data, cb = noop) => {
    log(`saving file ${filePath} with data ${data}`);
    fs.writeFile(filePath, JSON.stringify(data, null, 2), cb);
  };

const saveHostData =
  (host, cb) => {
    const filePath = path.join(host.cacheDir, 'host.json');
    saveFile(filePath, host, err => {
      cb(err, host);
    });
  };

const saveYears =
  (host, cb = noop) => {
    async.each(host.years, (year, eachCb) => {
      saveYear(host, year, eachCb);
    }, cb);
  };

const saveYear =
  (host, year, cb = noop) => {
    const filePath = path.join(host.cacheDir, year.num + '.json');
    saveFile(filePath, year, cb);
  };

const prepareSaveHost =
  (host, next = noop) => {
    fs.mkdir(host.cacheDir, err => {
      // ignore dir exists error
      if (err && err.code && err.code !== 'EEXIST') {
        return next(err);
      }

      next(null, host);
    });
  };

const saveHost =
  (host, cb = noop) => {
    host.cacheDir = path.join(process.cwd(), 'hosts', host.name, '.cache');
    log(`saving host in cacheDir: ${host.cacheDir}`);

    async.waterfall([
      // getting the host variable passed to saveHost into async's scope
      (next) => prepareSaveHost(host, next),
      saveHostData,
      saveYears,
    ], cb);
  };

const saveHosts =
  (hosts, cb = noop) => {
    async.each(hosts, saveHost, err => {
      if (err) { throw err; }
      cb();
    });
  };

export default saveHosts;
