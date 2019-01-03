import BaseError from './BaseError';
import SqlError from './SqlError';

let error;

try {
    throw new SqlError('An unknown sql error has occurred', 'SQLERROR_UNKNOWN');
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

    it(`is an instance of ${SqlError.name}`, () => {
        expect(error).toBeInstanceOf(SqlError);
    });

    it(`is named SqlError`, () => {
        expect(error.name).toBe('SqlError');
    });

    it(`contains the message 'An unknown sql error has occurred'`, () => {
        expect(error.message).toBe('An unknown sql error has occurred');
    });

    it(`contains the code 'SQLERROR_UNKNOWN'`, () => {
        expect(error.code).toBe('SQLERROR_UNKNOWN');
    });
});

describe(`function error`, () => {
    let error;

    function generate() {
        throw new SqlError('An unknown sql error has occurred', 'SQLERROR_UNKNOWN');
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

    it(`is an instance of ${SqlError.name}`, () => {
        expect(error).toBeInstanceOf(SqlError);
    });

    it(`is named SqlError`, () => {
        expect(error.name).toBe('SqlError');
    });

    it(`contains the message 'An unknown sql error has occurred'`, () => {
        expect(error.message).toBe('An unknown sql error has occurred');
    });

    it(`contains the code 'SQLERROR_UNKNOWN'`, () => {
        expect(error.code).toBe('SQLERROR_UNKNOWN');
    });
});

describe(`method error`, () => {
    let error;

    const generator = new (class generator {
        generate() {
            throw new SqlError('An unknown sql error has occurred', 'SQLERROR_UNKNOWN');
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

    it(`is an instance of ${SqlError.name}`, () => {
        expect(error).toBeInstanceOf(SqlError);
    });

    it(`is named SqlError`, () => {
        expect(error.name).toBe('SqlError');
    });

    it(`contains the message 'An unknown sql error has occurred'`, () => {
        expect(error.message).toBe('An unknown sql error has occurred');
    });

    it(`contains the code 'SQLERROR_UNKNOWN'`, () => {
        expect(error.code).toBe('SQLERROR_UNKNOWN');
    });
});

describe(`arrow function error`, () => {
    let error;

    const generate = () => {
        throw new SqlError('An unknown sql error has occurred', 'SQLERROR_UNKNOWN');
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

    it(`is an instance of ${SqlError.name}`, () => {
        expect(error).toBeInstanceOf(SqlError);
    });

    it(`is named SqlError`, () => {
        expect(error.name).toBe('SqlError');
    });

    it(`contains the message 'An unknown sql error has occurred'`, () => {
        expect(error.message).toBe('An unknown sql error has occurred');
    });

    it(`contains the code 'SQLERROR_UNKNOWN'`, () => {
        expect(error.code).toBe('SQLERROR_UNKNOWN');
    });
});