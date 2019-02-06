const BaseError = require('./base');

module.exports = class NotImplementedError extends BaseError {
    constructor(message, cause) {
        super(message, cause);

        if (message === undefined) {
            const [className, methodName] = new Error().stack.split('\n')[2].match(/ at (?:(.*?)\.)?(.*?) \(/).slice(1);
            const hasClassName = className && !/^Function$/.test(className);
            const hasMethodName = methodName && !/^<anonymous>$/.test(methodName);

            if (hasClassName && hasMethodName) {
                this.message = `${methodName} is not implemented by ${className}`;
            } else if (hasMethodName) {
                this.message = `${methodName} is not implemented`;
            } else {
                this.message = 'Not implemented';
            }
        }
    }

    static create(message, cause) {
        return new NotImplementedError(message, cause);
    }
};