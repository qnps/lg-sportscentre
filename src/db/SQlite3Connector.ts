import sqlite3 = require('sqlite3');
sqlite3.verbose();

import { SqlError } from '../error';
import { DbConnector, DbConnectorOptions } from '../interfaces';

import BaseConnector from './BaseConnector';

export default class Sqlite3Connector extends BaseConnector implements DbConnector {
    public readonly file: string;
    public readonly mode: number = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;
    public readonly busyTimeout: number = 2000;
    public readonly foreignKeys: boolean = true;

    private connection: sqlite3.Database;

    public constructor(options: Sqlite3ConnectorOptions) {
        super(options);
    }

    private static parseError(error: Sqlite3Error): SqlError {
        const [message] = error.toString().match(/Error: (.*?): (.*)/).slice(2);
        return new SqlError(message, error.code, error.errno);
    }

    public close(): Promise<undefined> {
        return new Promise((resolve, reject) => {
            if (this.connection) {
                this.connection.close((error?: Sqlite3Error) => {
                    if (error) {
                        return reject(Sqlite3Connector.parseError(error));
                    }

                    this.connection = undefined;
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    public connect(): Promise<undefined> {
        return new Promise((resolve, reject) => {
            if (!this.connection) {
                this.connection = new sqlite3.Database(this.file, this.mode, error => {
                    if (error) {
                        this.connection = undefined;
                        return reject(Sqlite3Connector.parseError(error));
                    }

                    if (this.busyTimeout > 0) {
                        this.connection.configure('busyTimeout', this.busyTimeout);
                    }

                    this.connection.run(`PRAGMA foreign_keys=${this.foreignKeys ? 'on' : 'off'}`, (error?: Sqlite3Error) => {
                        if (error) {
                            const rejectWithError = () =>
                                reject(Sqlite3Connector.parseError(error));

                            return this.close()
                                .then(rejectWithError)
                                .catch(rejectWithError);
                        }

                        resolve();
                    });
                });
            } else {
                resolve();
            }
        });
    }
}

interface Sqlite3ConnectorOptions extends DbConnectorOptions {
    file: string;
    mode?: number;
    busyTimeout?: number;
    foreignKeys?: boolean;
}

interface Sqlite3Error {
    Error: string;
    errno: number;
    code: string;
}