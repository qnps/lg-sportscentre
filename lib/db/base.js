const { NotImplementedError } = require('../error');
const { checkAbstract } = require('../utils');

module.exports = class BaseConnector {
    constructor(options = {}) {
        checkAbstract(this, BaseConnector);

        for (const [key, value] of Object.entries(options)) {
            this[key] = value;
        }

        this.close = this.close.bind(this);
        this.connect = this.connect.bind(this);
    }

    close() {
        throw new NotImplementedError();
    }

    connect() {
        throw new NotImplementedError();
    }
};