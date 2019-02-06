const BaseError = require('./base');

module.exports = class ApiError extends BaseError {
    constructor(message, statusCode, cause) {
        super(message, cause);
        this.statusCode = statusCode;

        if (message === undefined) {
            this.message = 'An unknown api error has occurred';
        }
    }

    static create(message, statusCode, cause) {
        return new ApiError(message, statusCode, cause);
    }
};