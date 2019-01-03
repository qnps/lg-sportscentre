import mariadb = require('mariadb');
import Pool = require('mariadb/lib/pool');

import { SqlError } from '../error';
import { DbConnector, DbConnectorOptions } from '../interfaces';

import BaseConnector from './BaseConnector';

export default class MariaDbConnector extends BaseConnector implements DbConnector {
    public readonly host: string;
    public readonly user: string;
    public readonly password: string;
    public readonly connectionLimit: number = 25;

    private pool: Pool;

    public constructor(options: MariaDbConnectorOptions) {
        super(options);
    }

    private createPool(): Pool {
        return mariadb.createPool({
            host: this.host,
            user: this.user,
            password: this.password,
            connectionLimit: this.connectionLimit
        });
    }

    public close(): Promise<undefined> {
        return new Promise((resolve, reject) => {
            if (this.pool) {
                this.pool.end()
                    .then(() => this.pool = undefined)
                    .then(resolve)
                    .catch((error: Error) => reject(new SqlError(error.message, undefined, undefined, error)));
            } else {
                resolve();
            }
        });
    }

    public connect(): Promise<undefined> {
        return new Promise((resolve, reject) => {
            this.pool || (this.pool = this.createPool());

            this.pool.getConnection()
                .then(resolve)
                .catch((error: Error) => reject(new SqlError(error.message, undefined, undefined, error)));
        });
    }
}

interface MariaDbConnectorOptions extends DbConnectorOptions {
    host: string;
    user: string;
    password: string;
    connectionLimit?: number;
}