import 'jest';

import BaseApi from './base';
import SpnhlApi from './spnhl';

const api = new SpnhlApi();

jest.setTimeout(15000);

it(`is an instance of ${BaseApi.name}`, () => {
    expect(api).toBeInstanceOf(BaseApi);
});

it(`is an instance of ${SpnhlApi.name}`, () => {
    expect(api).toBeInstanceOf(SpnhlApi);
});

it(`implements ${SpnhlApi.create.name}`, () => {
    const api = SpnhlApi.create();

    expect.assertions(2);
    expect(api).toBeInstanceOf(BaseApi);
    expect(api).toBeInstanceOf(SpnhlApi);
});

it(`implements ${SpnhlApi.prototype.getGames.name}`, () => {
    const promise = api.getGames();

    expect.assertions(2);
    expect(promise).toBeInstanceOf(Promise);
    return expect(promise).resolves.toBeInstanceOf(Array);
});

it(`implements ${SpnhlApi.prototype.getTeams.name}`, () => {
    const promise = api.getTeams();

    expect.assertions(2);
    expect(promise).toBeInstanceOf(Promise);

    return expect(promise).resolves.toMatchObject({
        5090: {
            id: 5090,
            name: 'San Jose Sharks',
            shortName: 'Sharks',
        },
    });
});