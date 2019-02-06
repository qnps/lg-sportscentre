const BaseError = require('./base');
const NotImplementedError = require('./not-implemented');

let error;

try {
    throw new NotImplementedError();
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

    it(`is an instance of ${NotImplementedError.name}`, () => {
        expect(error).toBeInstanceOf(NotImplementedError);
    });

    it(`is named NotImplementedError`, () => {
        expect(error.name).toBe('NotImplementedError');
    });

    it(`contains the message 'Not implemented'`, () => {
        expect(error.message).toBe('Not implemented');
    });
});

describe(`function error`, () => {
    let error;

    function generate() {
        throw new NotImplementedError();
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

    it(`is an instance of ${NotImplementedError.name}`, () => {
        expect(error).toBeInstanceOf(NotImplementedError);
    });

    it(`is named NotImplementedError`, () => {
        expect(error.name).toBe('NotImplementedError');
    });

    it(`contains the message '${generate.name} is not implemented'`, () => {
        expect(error.message).toBe(`${generate.name} is not implemented`);
    });
});

describe(`method error`, () => {
    let error;

    const generator = new (class generator {
        generate() {
            throw new NotImplementedError();
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

    it(`is an instance of ${NotImplementedError.name}`, () => {
        expect(error).toBeInstanceOf(NotImplementedError);
    });

    it(`is named NotImplementedError`, () => {
        expect(error.name).toBe('NotImplementedError');
    });

    it(`contains the message '${generator.generate.name} is not implemented by ${generator.constructor.name}'`, () => {
        expect(error.message).toBe(`${generator.generate.name} is not implemented by ${generator.constructor.name}`);
    });
});

describe(`arrow function error`, () => {
    let error;

    const generate = () => {
        throw new NotImplementedError();
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

    it(`is an instance of ${NotImplementedError.name}`, () => {
        expect(error).toBeInstanceOf(NotImplementedError);
    });

    it(`is named NotImplementedError`, () => {
        expect(error.name).toBe('NotImplementedError');
    });

    it(`contains the message '${generate.name} is not implemented'`, () => {
        expect(error.message).toBe(`${generate.name} is not implemented`);
    });
});