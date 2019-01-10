export default abstract class BaseError extends Error {
    public readonly cause?: Error;

    constructor(message?: string, cause?: Error) {
        super(message);
        this.name = this.constructor.name;
        this.cause = cause;
    }
}