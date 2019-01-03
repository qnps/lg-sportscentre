import { WebError } from '../interfaces';

import BaseError from './BaseError';

export default class ApiError extends BaseError implements WebError {
    public readonly statusCode?: string | number;

    public constructor(message?: string, statusCode?: string | number, cause?: Error) {
        super(message, cause);
        this.statusCode = statusCode;

        if (message === undefined) {
            this.message = 'An unknown api error has occurred';
        }
    }

    public static create(message?: string, statusCode?: string | number, cause?: Error): ApiError {
        return new ApiError(message, statusCode, cause);
    }
}