import 'jest';

import { LogLevel } from '../enums';

import DefaultLogger from './logger';
const Logger = DefaultLogger.create({ level: LogLevel.NONE });

const defaultDateFormat = '\\[YYYY-MM-DD HH:mm:ss\\]';
const defaultLevel = LogLevel.WARN;

it(`has default date format ${defaultDateFormat}`, () => {
    expect(DefaultLogger.dateFormat).toEqual(defaultDateFormat);
});

it(`has default level ${LogLevel[defaultLevel]}`, () => {
    expect(DefaultLogger.level).toEqual(defaultLevel);
});

it(`can change level to ${LogLevel[LogLevel.NONE]}`, () => {
    DefaultLogger.level = LogLevel.NONE;
    expect(DefaultLogger.level).toEqual(LogLevel.NONE);
});

it(`implements ${Logger.clear.name}`, () =>
    expect(Logger.clear()).resolves.toBeUndefined());

it(`implements ${Logger.debug.name}`, () =>
    expect(Logger.debug('DEBUG TEST')).resolves.toBeUndefined());

it(`implements ${Logger.error.name}`, () =>
    expect(Logger.error('ERROR TEST')).resolves.toBeUndefined());

it(`implements ${Logger.info.name}`, () =>
    expect(Logger.info('INFO TEST')).resolves.toBeUndefined());

it(`implements ${Logger.log.name}`, () =>
    expect(Logger.log('LOG TEST')).resolves.toBeUndefined());

it(`implements ${Logger.warn.name}`, () =>
    expect(Logger.warn('WARN TEST')).resolves.toBeUndefined());

it(`implements ${Logger.verbose.name}`, () => 
    expect(Logger.verbose('VERBOSE TEST')).resolves.toBeUndefined());