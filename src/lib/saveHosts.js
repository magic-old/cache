import {each, waterfall} from 'async';
import {writeFile} from 'fs';
import {log} from 'log';

function saveFile(filePath, data, cb) {
  log(`saving file ${filePath} with data ${data}`);
  fs.writeFile(filePath, JSON.stringify(data, null, 2), cb);
}

function saveHostData(host, cb) {
  var filePath = path.join(host.cacheDir, 'host.json');
  saveFile(filePath, host, (err) => {
    cb(err, host);
  });
}

function saveYears(host, cb) {
  each(host.years, (year, eachCb) => {
    saveYear(host, year, eachCb);
  }, cb);
}

function saveYear(host, year, cb) {
  var filePath = path.join(host.cacheDir, year.num + '.json');
  saveFile(filePath, year, cb);
}

function saveHost(host, cb) {
  log(`saving host: ${host}`);
  host.cacheDir = path.join(process.cwd(), 'hosts', host.name, '.cache');
  log(`saving host in cacheDir: ${host.cacheDir}`);
  waterfall([
      //getting the host variable passed to saveHost into async's scope
      next => {
        fs.mkdir(host.cacheDir, err => {
          //ignore dir exists error
          if ( err && err.code && err.code !== 'EEXIST') { return next(err); }
          next(null, host);
        });
      }
    , saveHostData
    , saveYears
  ],  cb);
}

function saveHosts(hosts, cb) {
  each(hosts, saveHost, err => {
    if ( err ) { throw err; }
    cb();
  });
}

export default saveHosts;
