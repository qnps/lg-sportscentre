const createEnum = require('./base');

module.exports.LogLevel = createEnum({
    VERBOSE: 1,
    DEBUG: 2,
    INFO: 3,
    WARN: 4,
    ERROR: 5,
    NONE: Infinity,
});