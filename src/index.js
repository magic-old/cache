import { map, waterfall } from 'async';
import saveHosts from './lib/saveHosts';
import parsePost from './lib/parsePost';
import getHosts from './lib/getHosts';
import getArchives from './lib/getArchives';

import log from 'magic-server-log';
import fsutils from 'magic-fs';

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const noop = () => {};

const getYearlyArchive =
  (host, cb = noop) => {
    getArchives(host.dir, (err, years) => {
      if (err) {
        return cb(err);
      }

      map(years, getMonthlyArchive, (err, yearlyArchives) => {
        host.years = yearlyArchives;
        cb(err, host);
      });
    });
  };

const getMonthlyArchive =
  (year, cb = noop) => {
    getArchives(year.dir, (err, months) => {
      if (err) {
        return cb(err);
      }

      map(months, getBlogPosts, (err, monthlyArchives) => {
        year.months = monthlyArchives;
        cb(err, year);
      });
    });
  };

const getBlogPosts =
  (month, cb = noop) => {
    fsutils.findSubFiles(month.dir, (err, files) => {
      if (err) {
        cb(err);
      }

      map(files, parsePost, (err, posts) => {
        month.posts = posts;
        month.name = monthNames[month.num - 1];
        cb(err, month);
      });
    });
  };

const getBlogData =
  (hosts, cb = noop) => {
    // ~ log(`magic-cache: getBlogData called with hosts ${JSON.stringify(hosts)}`);
    map(hosts, getYearlyArchive, cb);
  };

const init =
  () => {
    waterfall([
      getHosts,
      getBlogData,
    ],
    (err, hosts) => {
      if (err) {
        throw err;
      }

      log(`pre host save, hostsAsObject: ${hosts}`);
      saveHosts(hosts, function (err) {
        if (err) {
          throw err;
        }
        log('saving hosts done, blogdata set.');
      });
    });
  };

init();
