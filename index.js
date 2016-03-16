'use strict';

var _async = require('async');

var _saveHosts = require('./lib/saveHosts');

var _saveHosts2 = _interopRequireDefault(_saveHosts);

var _parsePost = require('./lib/parsePost');

var _parsePost2 = _interopRequireDefault(_parsePost);

var _getHosts = require('./lib/getHosts');

var _getHosts2 = _interopRequireDefault(_getHosts);

var _getArchives = require('./lib/getArchives');

var _getArchives2 = _interopRequireDefault(_getArchives);

var _magicServerLog = require('magic-server-log');

var _magicServerLog2 = _interopRequireDefault(_magicServerLog);

var _magicFs = require('magic-fs');

var _magicFs2 = _interopRequireDefault(_magicFs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

var noop = function noop() {};

var getYearlyArchive = function getYearlyArchive(host) {
  var cb = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

  (0, _getArchives2.default)(host.dir, function (err, years) {
    if (err) {
      return cb(err);
    }

    (0, _async.map)(years, getMonthlyArchive, function (err, yearlyArchives) {
      host.years = yearlyArchives;
      cb(err, host);
    });
  });
};

var getMonthlyArchive = function getMonthlyArchive(year) {
  var cb = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

  (0, _getArchives2.default)(year.dir, function (err, months) {
    if (err) {
      return cb(err);
    }

    (0, _async.map)(months, getBlogPosts, function (err, monthlyArchives) {
      year.months = monthlyArchives;
      cb(err, year);
    });
  });
};

var getBlogPosts = function getBlogPosts(month) {
  var cb = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

  _magicFs2.default.findSubFiles(month.dir, function (err, files) {
    if (err) {
      cb(err);
    }

    (0, _async.map)(files, _parsePost2.default, function (err, posts) {
      month.posts = posts;
      month.name = monthNames[month.num - 1];
      cb(err, month);
    });
  });
};

var getBlogData = function getBlogData(hosts) {
  var cb = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

  // ~ log(`magic-cache: getBlogData called with hosts ${JSON.stringify(hosts)}`);
  (0, _async.map)(hosts, getYearlyArchive, cb);
};

var init = function init() {
  (0, _async.waterfall)([_getHosts2.default, getBlogData], function (err, hosts) {
    if (err) {
      throw err;
    }

    (0, _magicServerLog2.default)('pre host save, hostsAsObject: ' + hosts);
    (0, _saveHosts2.default)(hosts, function (err) {
      if (err) {
        throw err;
      }
      (0, _magicServerLog2.default)('saving hosts done, blogdata set.');
    });
  });
};

init();

//# sourceMappingURL=index.js.map