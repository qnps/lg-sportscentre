const BaseError = require('./base');

module.exports = class SqlError extends BaseError {
    constructor(message, code, number, cause) {
        super(message, cause);
        this.code = code;
        this.number = number;

        if (message === undefined) {
            this.message = 'An unknown sql error has occurred';
        }
    }

    static create(message, code, number, cause) {
        return new SqlError(message, code, number, cause);
    }
};