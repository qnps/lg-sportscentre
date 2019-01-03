import BaseConnector from './BaseConnector';
import MariaDbConnector from './MariaDbConnector';

const config = {host: 'localhost', user: 'root', password: ''};
const connector = new MariaDbConnector(config);

it(`is an instance of ${BaseConnector.name}`, () => {
    expect(connector).toBeInstanceOf(BaseConnector);
});

it(`is an instance of ${MariaDbConnector.name}`, () => {
    expect(connector).toBeInstanceOf(MariaDbConnector);
});

it(`has properties ${Object.entries(config).reduce((props, [key, value]) => [...props, `${key}='${value}'`], []).join(', ')}`, () => {
    for (const [key, value] of Object.entries(config)) {
        expect(connector[key]).toEqual(value);
    }
});

it(`implements ${MariaDbConnector.prototype.close.name}`, done => {
    setTimeout(done, 100);
    expect(connector.close().catch(()=>{})).toBeInstanceOf(Promise);
});

it(`implements ${MariaDbConnector.prototype.connect.name}`, done => {
    setTimeout(done, 100);
    expect(connector.connect().catch(()=>{})).toBeInstanceOf(Promise);
});