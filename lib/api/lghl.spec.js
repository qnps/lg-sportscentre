const BaseApi = require('./base');
const LghlApi = require('./lghl');

const api = new LghlApi();
const leagueId = 67;
const seasonId = 9;
const forumId = 586;

jest.setTimeout(15000);

it(`is an instance of ${BaseApi.name}`, () => {
    expect(api).toBeInstanceOf(BaseApi);
});

it(`is an instance of ${LghlApi.name}`, () => {
    expect(api).toBeInstanceOf(LghlApi);
});

it(`implements ${LghlApi.create.name}`, () => {
    const api = LghlApi.create();

    expect.assertions(2);
    expect(api).toBeInstanceOf(BaseApi);
    expect(api).toBeInstanceOf(LghlApi);
});

it(`implements ${LghlApi.prototype.getDailyStars.name}`, () => {
    const promise = api.getDailyStars({ forumId });

    expect.assertions(2);
    expect(promise).toBeInstanceOf(Promise);
    return expect(promise).resolves.toBeInstanceOf(Array);
});

it(`implements ${LghlApi.prototype.getGames.name}`, () => {
    const promise = api.getGames({ leagueId, seasonId });

    expect.assertions(2);
    expect(promise).toBeInstanceOf(Promise);
    return expect(promise).resolves.toBeInstanceOf(Array);
});

it(`implements ${LghlApi.prototype.getInfo.name}`, () => {
    const promise = api.getInfo({ leagueId });

    expect.assertions(2);
    expect(promise).toBeInstanceOf(Promise);

    return expect(promise).resolves.toMatchObject({
        id: leagueId,
        name: 'LGHL PSN',
        forumId: 586,
    });
});

it(`implements ${LghlApi.prototype.getNews.name}`, () => {
    const promise = api.getNews({ leagueId, seasonId });

    expect.assertions(2);
    expect(promise).toBeInstanceOf(Promise);
    return expect(promise).resolves.toBeInstanceOf(Array);
});

it(`implements ${LghlApi.prototype.getTeams.name}`, () => {
    const promise = api.getTeams({ leagueId, seasonId });

    expect.assertions(2);
    expect(promise).toBeInstanceOf(Promise);

    return expect(promise).resolves.toMatchObject({
        15: {
            id: 15,
            name: 'San Jose Sharks',
            shortName: 'Sharks',
        },
    });
});