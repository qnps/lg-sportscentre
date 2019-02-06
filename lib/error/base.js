const { checkAbstract } = require('../utils');

module.exports = class BaseError extends Error {
    constructor(message, cause) {
        super(message);
        checkAbstract(this, BaseError);

        this.name = this.constructor.name;
        this.cause = cause;
    }
};