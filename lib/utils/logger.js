const moment = require('moment');

const { LogLevel } = require('../enums');

class Logger {
    constructor({ dateFormat = '\\[YYYY-MM-DD HH:mm:ss\\]', level = LogLevel.WARN } = {}) {
        this.dateFormat = dateFormat;
        this.level = level;

        this.clear = this.clear.bind(this);
        this.debug = this.debug.bind(this);
        this.error = this.error.bind(this);
        this.info = this.info.bind(this);
        this.log = this.log.bind(this);
        this.shouldWrite = this.shouldWrite.bind(this);
        this.warn = this.warn.bind(this);
        this.write = this.write.bind(this);
        this.verbose = this.verbose.bind(this);
    }

    clear() {
        return new Promise((resolve) => {
            console.clear();
            resolve();
        });
    }

    create(options) {
        return new Logger(options);
    }

    debug(...params) {
        return this.write(LogLevel.DEBUG, ...params);
    }

    error(...params) {
        return this.write(LogLevel.ERROR, ...params);
    }

    info(...params) {
        return this.write(LogLevel.INFO, ...params);
    }

    log(...params) {
        return this.debug(...params);
    }

    shouldWrite(level) {
        return (level >= this.level) && (level < LogLevel.NONE);
    }

    warn(...params) {
        return this.write(LogLevel.WARN, ...params);
    }

    write(level, ...params) {
        return new Promise((resolve) => {
            if (this.shouldWrite(level)) {
                const payload = this.dateFormat
                    ? [moment().format(this.dateFormat), `[${LogLevel[level]}]`, ...params]
                    : [`[${LogLevel[level]}]`, ...params];
    
                switch (level) {
                    case LogLevel.DEBUG:
                        console.debug(...payload);
                        break;
    
                    case LogLevel.ERROR:
                        console.error(...payload);
                        break;
    
                    case LogLevel.INFO:
                        console.info(...payload);
                        break;
    
                    case LogLevel.WARN:
                        console.warn(...payload);
                        break;
    
                    default:
                        console.log(...payload);
                        break;
                }
            }
    
            resolve();
        });
    }

    verbose(...params) {
        return this.write(LogLevel.VERBOSE, ...params);
    }
}

Logger.LEVEL_VERBOSE = LogLevel.VERBOSE;
Logger.LEVEL_DEBUG = LogLevel.DEBUG;
Logger.LEVEL_INFO = LogLevel.INFO;
Logger.LEVEL_WARN = LogLevel.WARN;
Logger.LEVEL_ERROR = LogLevel.ERROR;
Logger.LEVEL_NONE = LogLevel.NONE;

module.exports = new Logger();