const moment = require('moment-timezone');

const BaseApi = require('./base');
const VghlApi = require('./vghl');

const api = new VghlApi();
const leagueId = 'vgnhl';
const seasonId = moment.tz(api.defaultTimezone).startOf('week').format('YYYYMMDD');

jest.setTimeout(15000);

it(`is an instance of ${BaseApi.name}`, () => {
    expect(api).toBeInstanceOf(BaseApi);
});

it(`is an instance of ${VghlApi.name}`, () => {
    expect(api).toBeInstanceOf(VghlApi);
});

it(`implements ${VghlApi.create.name}`, () => {
    const api = VghlApi.create();

    expect.assertions(2);
    expect(api).toBeInstanceOf(BaseApi);
    expect(api).toBeInstanceOf(VghlApi);
});

it(`implements ${VghlApi.prototype.getGames.name}`, () => {
    const promise = api.getGames({ leagueId, seasonId });

    expect.assertions(2);
    expect(promise).toBeInstanceOf(Promise);
    return expect(promise).resolves.toBeInstanceOf(Array);
});

it(`implements ${VghlApi.prototype.getTeams.name}`, () => {
    const promise = api.getTeams({ leagueId, seasonId });

    expect.assertions(2);
    expect(promise).toBeInstanceOf(Promise);

    return expect(promise).resolves.toMatchObject({
        29: {
            id: 29,
            name: 'San Jose Sharks',
            shortName: 'Sharks',
        },
    });
});