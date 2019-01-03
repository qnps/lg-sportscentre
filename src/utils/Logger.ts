import moment = require('moment');

import { LogLevel } from '../enums';

class Logger {
    public dateFormat: string;
    public level: LogLevel;

    public static LEVEL_VERBOSE: LogLevel = LogLevel.VERBOSE;
    public static LEVEL_DEBUG: LogLevel = LogLevel.DEBUG;
    public static LEVEL_INFO: LogLevel = LogLevel.INFO;
    public static LEVEL_WARN: LogLevel = LogLevel.WARN;
    public static LEVEL_ERROR: LogLevel = LogLevel.ERROR;
    public static LEVEL_NONE: LogLevel = LogLevel.NONE;

    public constructor({ dateFormat = '\\[YYYY-MM-DD HH:mm:ss\\]', level = LogLevel.WARN }: LoggerOptions = {}) {
        this.dateFormat = dateFormat;
        this.level = level;

        this.clear = this.clear.bind(this);
        this.debug = this.debug.bind(this);
        this.error = this.error.bind(this);
        this.info = this.info.bind(this);
        this.log = this.log.bind(this);
        this.warn = this.warn.bind(this);
        this.verbose = this.verbose.bind(this);
    }

    private shouldWrite(level: LogLevel): boolean {
        return (level >= this.level) && (level < LogLevel.NONE);
    }

    private write(level: LogLevel, ...params: any): Promise<undefined> {
        return new Promise(resolve => {
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

    public clear(): Promise<undefined> {
        return new Promise(resolve => {
            console.clear();
            resolve();
        });
    }

    public create(options?: LoggerOptions): Logger {
        return new Logger(options);
    }

    public debug(...params: any): Promise<undefined> {
        return this.write(LogLevel.DEBUG, ...params);
    }

    public error(...params: any): Promise<undefined> {
        return this.write(LogLevel.ERROR, ...params);
    }

    public info(...params: any): Promise<undefined> {
        return this.write(LogLevel.INFO, ...params);
    }

    public log(...params: any): Promise<undefined> {
        return this.debug(...params);
    }

    public warn(...params: any): Promise<undefined> {
        return this.write(LogLevel.WARN, ...params);
    }

    public verbose(...params: any): Promise<undefined> {
        return this.write(LogLevel.VERBOSE, ...params);
    }
}

export default new Logger();

interface LoggerOptions {
    dateFormat?: string;
    level?: LogLevel;
}