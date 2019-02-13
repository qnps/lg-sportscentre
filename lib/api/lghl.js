const moment = require('moment-timezone');
const querystring = require('querystring');
const { normalizeDiacritics, normalizeName } = require('normalize-text');

const { NewsItemType } = require('../enums');
const { ApiError } = require('../error');

const BaseApi = require('./base');

module.exports = class LghlApi extends BaseApi {
    constructor(options = {}) {
        super(options);

        this.cleanNewsItem = this.cleanNewsItem.bind(this);
        this.getDailyStars = this.getDailyStars.bind(this);
        this.getGames = this.getGames.bind(this);
        this.getInfo = this.getInfo.bind(this);
        this.getNews = this.getNews.bind(this);
        this.getTeams = this.getTeams.bind(this);
        this.url = this.url.bind(this);
    }

    static create(options) {
        return new LghlApi(options);
    }

    cleanNewsItem(message) {
        return normalizeDiacritics(message
            .replace(/<img(?:[^>]+)?\/team(\d+)\.png(?:[^>]+)?><span(?:[^>]+)?>.*?<\/span>/g, (a, b) => `::team=${b}::`)
            .replace(/<\/span><span /g, '</span> <span ')
            .replace(/<[^>]+>/g, '')
            .replace(/[ ]+/g, ' '));
    }

    getDailyStars({ forumId, date = moment.tz(this.defaultTimezone).subtract(1, 'days') }) {
        return this.get({
            path: 'search/1/',
            q: moment(date, this.defaultTimezone).format('[Daily 3 Stars For] dddd MMMM Do, YYYY'),
            o: 'date',
            'c[title_only]': 1,
            'c[node]': forumId,
        }).then((html) => {
            const regex = /<h3(?:[^>]+)?><a(?:[^>]+)?href="(.*?)"(?:[^>]+)?>(.*?)<\/a><\/h3>/i;
            let data;

            if ((data = regex.exec(html)) === null) {
                return;
            }

            const [file] = data.slice(1);
            return this.get({ file , path: '' });
        }).then((html) => {
            const regex = /(?:<div(?:[^>]+)?d3_title(?:[^>]+)?>(.*?)<\/div>|<tr(?:[^>]+)?>(?:<td(?:[^>]+)?>(<img(?:[^>]+)?star\.gif(?:[^>]+)?>)+<\/td>|<td(?:[^>]+)?>(\d+)\.<\/td>)<td(?:[^>]+)?>(?:<div(?:[^>]+)?>.*?team(\d+).svg.*?<\/div><\/td><td(?:[^>]+)?>|<img(?:[^>]+)?team(\d+)\.png(?:[^>]+)?>)(.*?)(?: |<br(?:[^>]+)?><span(?:[^>]+)?>)\((\w+)\).*?<\/td><td(?:[^>]+)?>.*?<\/td><td(?:[^>]+)?>(.*?)<\/td><td(?:[^>]+)?>(.*?)<\/td><td(?:[^>]+)?>(.*?)<\/td><td(?:[^>]+)?>(.*?)<\/td><\/tr>)/ig;
            const stars = {};
            let data;
            let currentGroup;
            
            while ((data = regex.exec(html)) !== null) {
                const [
                    group,
                    starHtml,
                    rank,
                    starsTeamId,
                    teamId,
                    name,
                    position,
                    ...stats
                ] = data.slice(1);

                if (name) {
                    stars[currentGroup] || (stars[currentGroup] = []);

                    stars[currentGroup].push({
                        rank: parseInt((/star\.gif/g.exec(starHtml) || []).length || rank),
                        teamId: parseInt(starsTeamId || teamId),
                        name,
                        position,
                        stats: (position === 'G')
                            ? {
                                svPct: Number((parseFloat(stats[0]) / 100) + 0.0005).toFixed(3),
                                gaa: Number(parseFloat(stats[1]) + 0.0049).toFixed(2),
                                saves: parseInt(stats[2]),
                                shotsAgainst: parseInt(stats[3]),
                            } : {
                                points: parseInt(stats[0]),
                                goals: parseInt(stats[1]),
                                assists: parseInt(stats[2]),
                                plusMinus: parseInt(stats[3]),
                            }
                    });
                }

                if (group) {
                    currentGroup = group.trim().toLowerCase();
                }
            }

            return Object.values(stars).reduce((stars, group) => [...stars, ...group], []);
        });
    }

    getGames({ leagueId, seasonId }) {
        return this.get({
            action: 'league',
            page: 'league_schedule_all',
            leagueid: leagueId,
            seasonid: seasonId,
        }).then((html) => {
            const regex = /(?:<h4(?:[^>]+)?sh4(?:[^>]+)?>(.*?)<\/h4>|<span(?:[^>]+)?sweekid(?:[^>]+)?>Week \d+<\/span>(?:<span(?:[^>]+)?sgamenumber(?:[^>]+)?>Game# \d+<\/span>)?<img(?:[^>]+)?\/team(\d+)\.png(?:[^>]+)?><a(?:[^>]+)?&gameid=(\d+)(?:[^>]+)?><span(?:[^>]+)?steamname(?:[^>]+)?>.*?<\/span><span(?:[^>]+)?sscore(?:[^>]+)?>(?:vs|(\d+)\D+(\d+))<\/span><span(?:[^>]+)?steamname(?:[^>]+)?>.*?<\/span><\/a><img(?:[^>]+)?\/team(\d+)\.png(?:[^>]+)?>)/ig;
            const games = [];
            let data;
            let currentDate;

            while ((data = regex.exec(html)) !== null) {
                const [
                    date,
                    visitorId,
                    gameId,
                    visitorScore = null,
                    homeScore = null,
                    homeId,
                ] = data.slice(1);

                if (gameId) {
                    games.push({
                        id: parseInt(gameId),
                        date: currentDate,
                        visitor: {
                            id: parseInt(visitorId),
                            score: (visitorScore !== null) ? parseInt(visitorScore) : null,
                        },
                        home: {
                            id: parseInt(homeId),
                            score: (homeScore !== null) ? parseInt(homeScore) : null,
                        },
                    });
                }

                if (date) {
                    currentDate = this.parseDate(date, 'MMMM DD[th]').toDate();

                    if (moment().diff(currentDate, 'months') > 6) {
                        currentDate = moment(currentDate).add(1, 'year').toDate();
                    }
                }
            }

            return games;
        });
    }

    getInfo({ leagueId }) {
        return this.get({
            action: 'league',
            page: 'standing',
            leagueid: leagueId,
            seasonid: 1,
        }).then((html) => {
            const info = html.match(new RegExp(`<li(?:[^>]+)? custom-tab-(${leagueId}) (?:[^>]+)?><a(?:[^>]+)?/league\\.(\\d+)/(?:[^>]+)?>.*?<span(?:[^>]+)?>(.*?)</span>.*?</a>`, 'i'));

            if (info) {
                const season = html.match(new RegExp(`<a(?:[^>]+)?leagueid=${leagueId}&(?:amp;)?seasonid=(\\d+)(?:[^>]+)?>Roster.*?</a>`, 'i'));

                return {
                    id: parseInt(info[1]),
                    name: info[3].trim(),
                    seasonId: parseInt(season[1]),
                    forumId: parseInt(info[2])
                };
            } else {
                throw new ApiError(`Unable to load information for league ${leagueId}`);
            }
        });
    }

    getNews({ leagueId, seasonId, teamId = 0, typeId = 0, displayLimit = 500 }) {
        return this.get({
            action: 'league',
            page: 'team_news',
            teamid: teamId,
            typeid: typeId,
            displaylimit: displayLimit,
            leagueid: leagueId,
            seasonid: seasonId,
        }).then((html) => {
            const regex = /<li(?:[^>]+)? NewsFeedItem(?:[^>]+)?>(?:<a(?:[^>]+)?><img(?:[^>]+)?\/team(\d+).png(?:[^>]+)?>)?(?:<a(?:[^>]+)?><img(?:[^>]+)?\/(?:feed|icons?)\/(.*?).png(?:[^>]+)?>)?(?:<a(?:[^>]+)?><img(?:[^>]+)?\/team(\d+).png(?:[^>]+)?>)?<\/a><div(?:[^>]+)?><h3(?:[^>]+)?>(.*?)<\/h3><abbr(?:[^>]+)?>(.*?)<\/abbr><\/div><\/li>/ig;
            const items = [];
            let data;

            while ((data = regex.exec(html)) !== null) {
                const [
                    teamId = null,
                    type = NewsItemType.NEWS,
                    altTeamId = null,
                    message,
                    timestamp,
                ] = data.slice(1);

                items.unshift({
                    message: this.cleanNewsItem(message),
                    teams: [
                        teamId,
                        altTeamId,
                        ...(message.match(/team(\d+\.png)/) || []).map((t) => t.replace(/.*?team(\d+).*/, '$1')),
                    ].reduce((teams, team) => (team !== null) ? [...teams, parseInt(team)] : teams, []),
                    timestamp: this.parseDate(timestamp, 'YYYY-MM-DD HH:mma').toDate(),
                    type: NewsItemType[NewsItemType[type]] || NewsItemType.NEWS,
                });
            }

            return items;
        });
    }

    getTeams({ leagueId, seasonId }) {
        return this.get({
            action: 'league',
            page: 'standing',
            leagueid: leagueId,
            seasonid: seasonId,
        }).then((html) => {
            const regex = /<tr(?:[^>]+)?><td(?:[^>]+)?>(<div(?:[^>]+)?team_box_icon(?:[^>]+)?>)?.*?<a(?:[^>]+)?teamid=(\d+)(?:[^>]+)?>(.*?)<\/a>(?:<\/div>)?<\/td>/g;
            const teams = {};
            let data;

            while ((data = regex.exec(html)) !== null) {
                const [
                    isLongName,
                    id,
                    name,
                ] = data.slice(1);

                teams[id] || (teams[id] = { id: null, name: null, shortName: null });
                teams[id].id = parseInt(id);
                teams[id][isLongName ? 'name' : 'shortName'] = normalizeName(normalizeDiacritics(name.trim()));
            }

            return teams;
        });
    }
    
    url({ file = 'index.php', path = 'leaguegaming/league', ...params }) {
        return `https://www.leaguegaming.com/forums/${file}?${path}&${querystring.stringify(params)}`.replace(/[?&]+$/, '');
    }
};