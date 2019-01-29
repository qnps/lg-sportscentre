import 'jest';

import BaseError from './base';
import ApiError from './api';

let error;

try {
    throw new ApiError('An unknown api error has occurred', 500);
} catch (err) {
    error = err;
}

describe(`generic error`, () => {
    it(`is an instance of ${Error.name}`, () => {
        expect(error).toBeInstanceOf(Error);
    });

    it(`is an instance of ${BaseError.name}`, () => {
        expect(error).toBeInstanceOf(BaseError);
    });

    it(`is an instance of ${ApiError.name}`, () => {
        expect(error).toBeInstanceOf(ApiError);
    });

    it(`is named ApiError`, () => {
        expect(error.name).toBe('ApiError');
    });

    it(`contains the message 'An unknown api error has occurred'`, () => {
        expect(error.message).toBe('An unknown api error has occurred');
    });

    it(`contains the statusCode '500'`, () => {
        expect(error.statusCode).toBe(500);
    });
});

describe(`function error`, () => {
    let error;

    function generate() {
        throw new ApiError('An unknown api error has occurred', 500);
    }

    try {
        generate();
    } catch (err) {
        error = err;
    }

    it(`is an instance of ${Error.name}`, () => {
        expect(error).toBeInstanceOf(Error);
    });

    it(`is an instance of ${BaseError.name}`, () => {
        expect(error).toBeInstanceOf(BaseError);
    });

    it(`is an instance of ${ApiError.name}`, () => {
        expect(error).toBeInstanceOf(ApiError);
    });

    it(`is named ApiError`, () => {
        expect(error.name).toBe('ApiError');
    });

    it(`contains the message 'An unknown api error has occurred'`, () => {
        expect(error.message).toBe('An unknown api error has occurred');
    });

    it(`contains the statusCode '500'`, () => {
        expect(error.statusCode).toBe(500);
    });
});

describe(`method error`, () => {
    let error;

    const generator = new (class generator {
        generate() {
            throw new ApiError('An unknown api error has occurred', 500);
        }
    });

    try {
        generator.generate();
    } catch (err) {
        error = err;
    }

    it(`is an instance of ${Error.name}`, () => {
        expect(error).toBeInstanceOf(Error);
    });

    it(`is an instance of ${BaseError.name}`, () => {
        expect(error).toBeInstanceOf(BaseError);
    });

    it(`is an instance of ${ApiError.name}`, () => {
        expect(error).toBeInstanceOf(ApiError);
    });

    it(`is named ApiError`, () => {
        expect(error.name).toBe('ApiError');
    });

    it(`contains the message 'An unknown api error has occurred'`, () => {
        expect(error.message).toBe('An unknown api error has occurred');
    });

    it(`contains the statusCode '500'`, () => {
        expect(error.statusCode).toBe(500);
    });
});

describe(`arrow function error`, () => {
    let error;

    const generate = () => {
        throw new ApiError('An unknown api error has occurred', 500);
    };

    try {
        generate();
    } catch (err) {
        error = err;
    }

    it(`is an instance of ${Error.name}`, () => {
        expect(error).toBeInstanceOf(Error);
    });

    it(`is an instance of ${BaseError.name}`, () => {
        expect(error).toBeInstanceOf(BaseError);
    });

    it(`is an instance of ${ApiError.name}`, () => {
        expect(error).toBeInstanceOf(ApiError);
    });

    it(`is named ApiError`, () => {
        expect(error.name).toBe('ApiError');
    });

    it(`contains the message 'An unknown api error has occurred'`, () => {
        expect(error.message).toBe('An unknown api error has occurred');
    });

    it(`contains the statusCode '500'`, () => {
        expect(error.statusCode).toBe(500);
    });
});