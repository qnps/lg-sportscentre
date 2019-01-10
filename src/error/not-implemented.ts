import BaseError from './base';

export default class NotImplementedError extends BaseError {
    public constructor(message?: string, cause?: Error) {
        super(message, cause);

        if (message === undefined) {
            const [className, methodName] = new Error().stack.split('\n')[2].match(/ at (?:(.*?)\.)?(.*?) \(/).slice(1);
            const hasClassName: boolean = className && !/^Function$/.test(className);
            const hasMethodName: boolean = methodName && !/^<anonymous>$/.test(methodName);

            if (hasClassName && hasMethodName) {
                this.message = `${methodName} is not implemented by ${className}`;
            } else if (hasMethodName) {
                this.message = `${methodName} is not implemented`;
            } else {
                this.message = 'Not implemented';
            }
        }
    }

    public static create(message?: string, cause?: Error): NotImplementedError {
        return new NotImplementedError(message, cause);
    }
}