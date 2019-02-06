const mariadb = require('mariadb');

const { SqlError } = require('../error');

const BaseConnector = require('./base');

module.exports = class MariaDbConnector extends BaseConnector {
    constructor(options = {}) {
        super({
            connectionLimit: 25,
            ...options,
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            if (this.pool) {
                this.pool.end()
                    .then(() => this.pool = undefined)
                    .then(resolve)
                    .catch((error) => reject(new SqlError(error.message, undefined, undefined, error)));
            } else {
                resolve();
            }
        });
    }
    
    createPool() {
        return mariadb.createPool({
            host: this.host,
            user: this.user,
            password: this.password,
            connectionLimit: this.connectionLimit
        });
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.pool || (this.pool = this.createPool());

            this.pool.getConnection()
                .then(resolve)
                .catch((error) => reject(new SqlError(error.message, undefined, undefined, error)));
        });
    }
};