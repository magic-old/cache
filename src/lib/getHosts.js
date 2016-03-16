import async from 'async';
import fs from 'fs';
import fsutils from 'magic-fs';
import path from 'path';

const noop = () => {};

const prepareGetHosts =
  (cb = noop) => {
    const hostPath = path.join(process.cwd(), 'hosts');
    cb(null, hostPath);
  };

const filterByHost =
  (host, mapCb = noop) => {
    const hostArr = host.split('/');
    const name = hostArr[hostArr.length - 1];
    const dir = path.join(host, 'views', 'blog');

    fs.exists(dir, exists => {
      if (exists) {
        return mapCb(null, {
          dir,
          years: {},
          name,
        });
      }
      mapCb(`Host ${host} does not exist`);
    });
  };

const filterByBlogDir =
  (hosts, cb = noop) => {
    async.map(
      hosts,
      filterByHost,
      (err, hosts) => {
        if (err) {
          throw err;
        }

        hosts = hosts.map(
          ({ dir, name }) =>
          dir && name && { dir, name }
        );

        cb(null, hosts);
      }
    );
  };

export const getHostsWithBlog =
  (cb = noop) => {
    async.waterfall([
      prepareGetHosts,
      fsutils.findSubDirectories,
      filterByBlogDir,
    ],
    cb);
  };

export default getHostsWithBlog;
