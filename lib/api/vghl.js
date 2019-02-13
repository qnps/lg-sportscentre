const moment = require('moment-timezone');
const querystring = require('querystring');
const { normalizeDiacritics, normalizeName } = require('normalize-text');

const { Team } = require('../utils');

const BaseApi = require('./base');

module.exports = class VghlApi extends BaseApi {
    constructor(options = {}) {
        super(options);

        const { subdomain = 'vghl' } = options;
        this.subdomain = subdomain;

        this.getGames = this.getGames.bind(this);
        this.getTeamMap = this.getTeamMap.bind(this);
        this.getTeams = this.getTeams.bind(this);
        this.normalize = this.normalize.bind(this);
        this.url = this.url.bind(this);
    }

    static create(options) {
        return new VghlApi(options);
    }

    getGames({ leagueId, seasonId }) {
        return Promise.all([
            this.get({
                league: leagueId,
                path: 'schedule',
            }),
            this.getTeamMap({ leagueId, seasonId }),
        ]).then(([html, teams]) => {
            const regex = /<option(?:[^>]+)?value=["']?(\d{8})["']?(?:[^>]+)?>\d{4}-\d{2}-\d{2}<\/option>/ig;
            const weeks = [];
            let data;

            while ((data = regex.exec(html)) !== null) {
                weeks.push(data[1]);
            }

            return Promise.all(weeks.map((week) =>
                this.get({
                    league: leagueId,
                    path: 'schedule',
                    filter_scheduled_week: week,
                })
            )).then((responses) => {
                const regex = /(?:<div(?:[^>]+)?col-sm-12(?:[^>]+)?><table(?:[^>]+)?><thead(?:[^>]+)?><tr(?:[^>]+)?><th(?:[^>]+)?>\s+\w+ (\d+)\w{2} (\w+) (\d{4}) @ (\d+:\d+[ap]m)\s+<\/th><\/tr><\/thead><\/table><\/div>|<div(?:[^>]+)?mvg-table(?:[^>]+)?><div(?:[^>]+)?><div(?:[^>]+)?><div(?:[^>]+)?><div(?:[^>]+)?\bschedule-team-logo\b(?:[^>]+)?><img(?:[^>]+)?\/(\w+)\.[^\.]+(?:[^>]+)?><\/div><div(?:[^>]+)?\bschedule-team\b(?:[^>]+)?><div(?:[^>]+)?\bschedule-team-name\b(?:[^>]+)?>[^<]+<\/div><div(?:[^>]+)?\bschedule-team-record\b(?:[^>]+)?>[^<]+<\/div><\/div><div(?:[^>]+)?\bschedule-team-score\b(?:[^>]+)?>([^<]+)<\/div><\/div><div(?:[^>]+)?><div(?:[^>]+)?\bschedule-team-logo\b(?:[^>]+)?><img(?:[^>]+)?\/(\w+)\.[^\.]+(?:[^>]+)?><\/div><div(?:[^>]+)?\bschedule-team\b(?:[^>]+)?><div(?:[^>]+)?\bschedule-team-name\b(?:[^>]+)?>[^<]+<\/div><div(?:[^>]+)?\bschedule-team-record\b(?:[^>]+)?>[^<]+<\/div><\/div><div(?:[^>]+)?\bschedule-team-score\b(?:[^>]+)?>([^<]+)<\/div><\/div><\/div><div(?:[^>]+)?\bschedule-summary-link\b(?:[^>]+)?><a(?:[^>]+)?&(?:amp;)?id=(\d+)(?:[^>]+)?>[^<]+<\/a><\/div><\/div><\/div>)/ig;
                const games = [];
                let data;

                for (const html of responses) {
                    let currentDate;

                    while ((data = regex.exec(html)) !== null) {
                        const [
                            date,
                            month,
                            year,
                            time,
                            visitorTeam,
                            visitorScore = null,
                            homeTeam,
                            homeScore = null,
                            gameId,
                        ] = data.slice(1);

                        if (gameId) {
                            games.push({
                                id: parseInt(gameId),
                                date: currentDate,
                                visitor: {
                                    id: teams[visitorTeam],
                                    score: (visitorScore !== null) ? parseInt(visitorScore) : null,
                                },
                                home: {
                                    id: teams[homeTeam],
                                    score: (homeScore !== null) ? parseInt(homeScore) : null,
                                },
                            });
                        }

                        if (date) {
                            currentDate = this.parseDate(`${date} ${month} ${year} @ ${time}`, 'D MMMM YYYY [@] h:mma').toDate();

                            if (moment().diff(currentDate, 'months') > 6) {
                                currentDate = moment(currentDate).add(1, 'year').toDate();
                            }
                        }
                    }
                }

                return games.sort((a, b) => (a.date.valueOf() - b.date.valueOf()) || (a.id - b.id));
            });
        });
    }

    getTeamMap({ leagueId, seasonId }) {
        return this.get({
            league: leagueId,
            path: 'rosters',
            ...(seasonId ? { filter_schedule: seasonId } : undefined)
        }).then((html) => {
            const regex = /<a(?:[^>]+)?\/rosters\?id=(\d+)(?:[^>]+)?>(?:\s+)?<img(?:[^>]+)?\/(\w+)\.\w{3,4}(?:[^>]+)?>(?:\s+)?<\/a>/ig;
            const teams = {};
            let data;
    
            while ((data = regex.exec(html)) !== null) {
                teams[data[2]] = parseInt(data[1]);
            }
    
            return teams;
        });
    }

    getTeams({ leagueId, seasonId }) {
        return this.get({
            league: leagueId,
            path: 'player-statistics',
            ...(seasonId ? { filter_schedule: seasonId } : undefined)
        }).then((html) => {
            const teamSelect = html.match(/<select(?:[^>]+)?filter_stat_team(?:[^>]+)?><option(?:[^>]+)?>.*?<\/option>(.*?)<\/select>/)[1];
            const regex = /<option(?:[^>]+)?value=["']?(\d+)["']?(?:[^>]+)?>(.*?)<\/option>/ig;
            const teams = {};
            let data;

            while ((data = regex.exec(teamSelect)) !== null) {
                teams[data[1]] = {
                    id: parseInt(data[1]),
                    ...Team.from(this.normalize(data[2])),
                    name: this.normalize(data[2])
                };
            }

            return teams;
        });
    }

    normalize(value) {
        return normalizeName(normalizeDiacritics(value.trim()))
            .replace(/Bellevile/g, 'Belleville');
    }

    url({ subdomain = this.subdomain, league, path, ...params }) {
        return `https://${subdomain}.myvirtualgaming.com/vghlleagues/${league}/${path}?${querystring.stringify(params)}`.replace(/\?$/, '');
    }
};