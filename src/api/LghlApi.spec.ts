import moment = require('moment-timezone');

import BaseApi from './BaseApi';
import LghlApi from './LghlApi';

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

    return expect(promise).resolves.toMatchObject({
        id: leagueId,
        name: 'LGHL PSN',
        forumId: 586,
    });
});

it(`implements ${LghlApi.prototype.getGames.name}`, () => {
    const promise = api.getGames({ leagueId, seasonId });

    expect.assertions(2);
    expect(promise).toBeInstanceOf(Promise);

    return expect(promise).resolves.toContainEqual({
        id: 502048,
        date: new Date('2018-11-13T05:00:00.000Z'),
        visitor: {
            id: 75,
            score: 0,
        },
        home: {
            id: 15,
            score: 10,
        },
    });
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

    return expect(promise).resolves.toContainEqual({
        message: 'Fraserburn has signed up for season 10 of the LGHL PSN as Position: Left Wing',
        teams: [],
        timestamp: new Date('2018-12-29T14:56:00.000Z'),
        type: 'news',
    });
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