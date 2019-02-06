const sqlite3 = require('sqlite3').verbose();

const { SqlError } = require('../error');

const BaseConnector = require('./base');

module.exports = class Sqlite3Connector extends BaseConnector {
    constructor(options = {}) {
        super({
            busyTimeout: 2000,
            foreignKeys: true,
            mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
            ...options,
        });
    }

    static parseError(error) {
        const [message] = error.toString().match(/Error: (.*?): (.*)/).slice(2);
        return new SqlError(message, error.code, error.errno);
    }

    close() {
        return new Promise((resolve, reject) => {
            if (this.connection) {
                this.connection.close((error) => {
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

    connect() {
        return new Promise((resolve, reject) => {
            if (!this.connection) {
                this.connection = new sqlite3.Database(this.file, this.mode, (error) => {
                    if (error) {
                        this.connection = undefined;
                        return reject(Sqlite3Connector.parseError(error));
                    }

                    if (this.busyTimeout > 0) {
                        this.connection.configure('busyTimeout', this.busyTimeout);
                    }

                    this.connection.run(`PRAGMA foreign_keys=${this.foreignKeys ? 'on' : 'off'}`, (error) => {
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
};