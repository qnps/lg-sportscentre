import os = require('os');

import BaseConnector from './BaseConnector';
import Sqlite3Connector from './SQlite3Connector';

const config = {file: `${os.tmpdir()}/duthie.db`};
const connector = new Sqlite3Connector(config);

it(`is an instance of ${BaseConnector.name}`, () => {
    expect(connector).toBeInstanceOf(BaseConnector);
});

it(`is an instance of ${Sqlite3Connector.name}`, () => {
    expect(connector).toBeInstanceOf(Sqlite3Connector);
});

it(`has properties ${Object.entries(config).reduce((props, [key, value]) => [...props, `${key}='${value}'`], []).join(', ')}`, () => {
    for (const [key, value] of Object.entries(config)) {
        expect(connector[key]).toEqual(value);
    }
});

it(`implements ${Sqlite3Connector.prototype.close.name}`, done => {
    setTimeout(done, 100);
    expect(connector.close().catch(()=>{})).toBeInstanceOf(Promise);
});

it(`implements ${Sqlite3Connector.prototype.connect.name}`, done => {
    setTimeout(done, 100);
    expect(connector.connect().catch(()=>{})).toBeInstanceOf(Promise);
});