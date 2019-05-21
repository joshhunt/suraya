const debug = require('debug');

module.exports = function(logName) {
  return debug(`suraya:${logName}`);
};
