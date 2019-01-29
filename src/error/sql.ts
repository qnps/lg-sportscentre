import { DatabaseError } from '../types';
import BaseError from './base';

export default class SqlError extends BaseError implements DatabaseError {
    public readonly code?: string;
    public readonly number?: number;

    public constructor(message?: string, code?: string, number?: number, cause?: Error) {
        super(message, cause);
        this.code = code;
        this.number = number;

        if (message === undefined) {
            this.message = 'An unknown sql error has occurred';
        }
    }

    public static create(message?: string, code?: string, number?: number, cause?: Error): SqlError {
        return new SqlError(message, code, number, cause);
    }
}