import moment = require('moment-timezone');
import normalize = require('normalize-text');
import querystring = require('querystring');
const { normalizeDiacritics, normalizeName } = normalize;

import { NewsItemType } from '../enums';
import { ApiError, NotImplementedError } from '../error';
import { ApiOptions, DailyStars, ExtendedApi, Game, League, NewsItem, Team, TeamList } from '../interfaces';

import BaseApi from './BaseApi';

export default class LghlApi extends BaseApi implements ExtendedApi {
    public constructor(options: ApiOptions = {}) {
        super(options);

        this.cleanNewsItem = this.cleanNewsItem.bind(this);
        this.url = this.url.bind(this);
        this.getDailyStars = this.getDailyStars.bind(this);
        this.getGames = this.getGames.bind(this);
        this.getInfo = this.getInfo.bind(this);
        this.getNews = this.getNews.bind(this);
        this.getTeams = this.getTeams.bind(this);
    }

    public static create(options?: ApiOptions): LghlApi {
        return new LghlApi(options);
    }

    private cleanNewsItem(message: string): string {
        return normalizeDiacritics(message
            .replace(/<img(?:[^>]+)?\/team(\d+)\.png(?:[^>]+)?><span(?:[^>]+)?>.*?<\/span>/g, (a, b) => `::team=${b}::`)
            .replace(/<\/span><span /g, '</span> <span ')
            .replace(/<[^>]+>/g, '')
            .replace(/[ ]+/g, ' '));
    }

    private url({ file = 'index.php', path = 'leaguegaming/league', ...params }: UrlParameters = {}): string {
        return `https://www.leaguegaming.com/forums/${file}?${path}&${querystring.stringify(params)}`.replace(/&$/, '');
    }

    public getDailyStars({ forumId, date = moment.tz(this.defaultTimezone).subtract(1, 'days') }: DailyStarParameter): Promise<DailyStars> {
        throw new NotImplementedError();
    }

    public getGames({ leagueId, seasonId }: LeagueSeasonParameter): Promise<Array<Game>> {
        return this.get(this.url({
            action: 'league',
            page: 'league_schedule_all',
            leagueid: leagueId,
            seasonid: seasonId,
        })).then((html: string) => {
            const regex: RegExp = /(?:<h4(?:[^>]+)?sh4(?:[^>]+)?>(.*?)<\/h4>|<span(?:[^>]+)?sweekid(?:[^>]+)?>Week \d+<\/span>(?:<span(?:[^>]+)?sgamenumber(?:[^>]+)?>Game# \d+<\/span>)?<img(?:[^>]+)?\/team(\d+)\.png(?:[^>]+)?><a(?:[^>]+)?&gameid=(\d+)(?:[^>]+)?><span(?:[^>]+)?steamname(?:[^>]+)?>.*?<\/span><span(?:[^>]+)?sscore(?:[^>]+)?>(?:vs|(\d+)\D+(\d+))<\/span><span(?:[^>]+)?steamname(?:[^>]+)?>.*?<\/span><\/a><img(?:[^>]+)?\/team(\d+)\.png(?:[^>]+)?>)/ig;
            const games: Array<Game> = [];
            let data: RegExpExecArray;
            let currentDate: Date;

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

    public getInfo({ leagueId }: LeagueParameter): Promise<League> {
        return this.get(this.url({
            action: 'league',
            page: 'standing',
            leagueid: leagueId,
            seasonid: 1,
        })).then((html: string) => {
            const info: RegExpMatchArray = html.match(new RegExp(`<li(?:[^>]+)? custom-tab-(${leagueId}) (?:[^>]+)?><a(?:[^>]+)?/league\\.(\\d+)/(?:[^>]+)?>.*?<span(?:[^>]+)?>(.*?)</span>.*?</a>`, 'i'));

            if (info) {
                const season: RegExpMatchArray = html.match(new RegExp(`<a(?:[^>]+)?leagueid=${leagueId}&(?:amp;)?seasonid=(\\d+)(?:[^>]+)?>Roster.*?</a>`, 'i'));

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

    public getNews({ leagueId, seasonId, teamId = 0, typeId = 0, displayLimit = 500 }: NewsParameter): Promise<Array<NewsItem>> {
        return this.get(this.url({
            action: 'league',
            page: 'team_news',
            teamid: teamId,
            typeid: typeId,
            displaylimit: displayLimit,
            leagueid: leagueId,
            seasonid: seasonId,
        })).then((html: string) => {
            const regex = /<li(?:[^>]+)? NewsFeedItem(?:[^>]+)?>(?:<a(?:[^>]+)?><img(?:[^>]+)?\/team(\d+).png(?:[^>]+)?>)?(?:<a(?:[^>]+)?><img(?:[^>]+)?\/(?:feed|icons?)\/(.*?).png(?:[^>]+)?>)?(?:<a(?:[^>]+)?><img(?:[^>]+)?\/team(\d+).png(?:[^>]+)?>)?<\/a><div(?:[^>]+)?><h3(?:[^>]+)?>(.*?)<\/h3><abbr(?:[^>]+)?>(.*?)<\/abbr><\/div><\/li>/ig;
            const items: Array<NewsItem> = [];
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
                        ...(message.match(/team(\d+\.png)/) || []).map(t => t.replace(/.*?team(\d+).*/, '$1'))
                    ].reduce((teams, team) => (team !== null) ? [...teams, parseInt(team)] : teams, []),
                    timestamp: this.parseDate(timestamp, 'YYYY-MM-DD HH:mma').toDate(),
                    type: NewsItemType[NewsItemType[type]] || NewsItemType.NEWS,
                });
            }

            return items;
        });
    }

    public getTeams({ leagueId, seasonId }: LeagueSeasonParameter): Promise<TeamList> {
        return this.get(this.url({
            action: 'league',
            page: 'standing',
            leagueid: leagueId,
            seasonid: seasonId,
        })).then((html: string) => {
            const regex = /<tr(?:[^>]+)?><td(?:[^>]+)?>(<div(?:[^>]+)?team_box_icon(?:[^>]+)?>)?.*?<a(?:[^>]+)?teamid=(\d+)(?:[^>]+)?>(.*?)<\/a>(?:<\/div>)?<\/td>/g;
            const teams: TeamList = {};
            let data;

            while ((data = regex.exec(html)) !== null) {
                const [
                    isLongName,
                    id,
                    name,
                ] = data.slice(1);

                teams[id] || (teams[id] = { id: null, name: null, shortName: null });
                teams[id].id = parseInt(id);
                teams[id][!!isLongName ? 'name' : 'shortName'] = normalizeName(normalizeDiacritics(name.trim()));
            }

            return teams;
        });
    }
}

interface DailyStarParameter {
    forumId: number;
    date?: number | Date | moment.Moment;
}

interface LeagueParameter {
    leagueId: number;
}

interface LeagueSeasonParameter extends LeagueParameter {
    seasonId: number;
}

interface NewsParameter extends LeagueSeasonParameter {
    teamId?: number;
    typeId?: number;
    displayLimit?: number;
}

interface UrlParameters {
    file?: string;
    path?: string;
    [prop: string]: any;
}