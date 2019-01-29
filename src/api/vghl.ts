import moment = require('moment-timezone');
import normalize = require('normalize-text');
import querystring = require('querystring');
const { normalizeDiacritics, normalizeName } = normalize;

import { ApiError, NotImplementedError } from '../error';
import { Api, ApiOptions, Game, TeamList } from '../types';
import { Team } from '../utils';

import BaseApi from './base';

export default class VghlApi extends BaseApi implements Api {
    public readonly subdomain: string;

    public constructor(options: VghlApiOptions = {}) {
        super(options);

        const {
            subdomain = 'vghl',
        } = options;

        this.subdomain = subdomain;

        this.getTeamMap = this.getTeamMap.bind(this);
        this.normalize = this.normalize.bind(this);
        this.url = this.url.bind(this);
        this.getGames = this.getGames.bind(this);
        this.getTeams = this.getTeams.bind(this);
    }

    public static create(options?: VghlApiOptions): VghlApi {
        return new VghlApi(options);
    }

    private getTeamMap({ leagueId, seasonId }: LeagueSeasonParameter): Promise<TeamMap> {
        return this.get(this.url({
            league: leagueId,
            path: 'rosters',
            ...(seasonId ? { filter_schedule: seasonId } : undefined)
        })).then((html: string) => {
            const regex: RegExp = /<a(?:[^>]+)?\/rosters\?id=(\d+)(?:[^>]+)?>(?:\s+)?<img(?:[^>]+)?\/(\w+)\.\w{3,4}(?:[^>]+)?>(?:\s+)?<\/a>/ig;
            const teams: TeamMap = {};
            let data: RegExpExecArray;

            while ((data = regex.exec(html)) !== null) {
                teams[data[2]] = parseInt(data[1]);
            }

            return teams;
        });
    }

    private normalize(value: string): string {
        return normalizeName(normalizeDiacritics(value.trim()))
            .replace(/Bellevile/g, 'Belleville');
    }

    private url({ subdomain = this.subdomain, league = 'vghl', path, ...params }: UrlParameters = {}): string {
        return `https://${subdomain}.myvirtualgaming.com/vghlleagues/${league}/${path}?${querystring.stringify(params)}`.replace(/\?$/, '');
    }

    public getGames({ leagueId, seasonId }: LeagueSeasonParameter): Promise<Array<Game>> {
        return Promise.all([
            this.get(this.url({
                league: leagueId,
                path: 'schedule',
            })),
            this.getTeamMap({ leagueId, seasonId })
        ]).then(([html, teams]: [string, TeamMap]) => {
            const regex: RegExp = /<option(?:[^>]+)?value=["']?(\d{8})["']?(?:[^>]+)?>\d{4}-\d{2}-\d{2}<\/option>/ig;
            const weeks: Array<string> = [];
            let data: RegExpExecArray;

            while ((data = regex.exec(html)) !== null) {
                weeks.push(data[1]);
            }

            return Promise.all(weeks.map((week: string) =>
                this.get(this.url({
                    league: leagueId,
                    path: 'schedule',
                    filter_scheduled_week: week,
                }))
            )).then((responses: Array<string>) => {
                const regex: RegExp = /(?:<div(?:[^>]+)?col-sm-12(?:[^>]+)?><table(?:[^>]+)?><thead(?:[^>]+)?><tr(?:[^>]+)?><th(?:[^>]+)?>\s+\w+ (\d+)\w{2} (\w+) (\d{4}) @ (\d+:\d+[ap]m)\s+<\/th><\/tr><\/thead><\/table><\/div>|<div(?:[^>]+)?mvg-table(?:[^>]+)?><div(?:[^>]+)?><div(?:[^>]+)?><div(?:[^>]+)?><div(?:[^>]+)?\bschedule-team-logo\b(?:[^>]+)?><img(?:[^>]+)?\/(\w+)\.[^\.]+(?:[^>]+)?><\/div><div(?:[^>]+)?\bschedule-team\b(?:[^>]+)?><div(?:[^>]+)?\bschedule-team-name\b(?:[^>]+)?>[^<]+<\/div><div(?:[^>]+)?\bschedule-team-record\b(?:[^>]+)?>[^<]+<\/div><\/div><div(?:[^>]+)?\bschedule-team-score\b(?:[^>]+)?>([^<]+)<\/div><\/div><div(?:[^>]+)?><div(?:[^>]+)?\bschedule-team-logo\b(?:[^>]+)?><img(?:[^>]+)?\/(\w+)\.[^\.]+(?:[^>]+)?><\/div><div(?:[^>]+)?\bschedule-team\b(?:[^>]+)?><div(?:[^>]+)?\bschedule-team-name\b(?:[^>]+)?>[^<]+<\/div><div(?:[^>]+)?\bschedule-team-record\b(?:[^>]+)?>[^<]+<\/div><\/div><div(?:[^>]+)?\bschedule-team-score\b(?:[^>]+)?>([^<]+)<\/div><\/div><\/div><div(?:[^>]+)?\bschedule-summary-link\b(?:[^>]+)?><a(?:[^>]+)?&(?:amp;)?id=(\d+)(?:[^>]+)?>[^<]+<\/a><\/div><\/div><\/div>)/ig;
                const games: Array<Game> = [];
                let data: RegExpExecArray;

                for (const html of responses) {
                    let currentDate: Date;

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

                return games.sort((a: Game, b: Game) => (a.date.valueOf() - b.date.valueOf()) || (a.id - b.id));
            });
        });
    }

    public getTeams({ leagueId, seasonId }: LeagueSeasonParameter): Promise<TeamList> {
        return this.get(this.url({
            league: leagueId,
            path: 'player-statistics',
            ...(seasonId ? { filter_schedule: seasonId } : undefined)
        })).then((html: string) => {
            const teamSelect: string = html.match(/<select(?:[^>]+)?filter_stat_team(?:[^>]+)?><option(?:[^>]+)?>.*?<\/option>(.*?)<\/select>/)[1];
            const regex: RegExp = /<option(?:[^>]+)?value=["']?(\d+)["']?(?:[^>]+)?>(.*?)<\/option>/ig;
            const teams: TeamList = {};
            let data: RegExpExecArray;

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
}

interface LeagueParameter {
    leagueId: string;
}

interface LeagueSeasonParameter extends LeagueParameter {
    seasonId?: string;
}

interface TeamMap {
    [prop: string]: number
}

interface UrlParameters {
    subdomain?: string;
    path?: string;
    [prop: string]: any;
}

interface VghlApiOptions extends ApiOptions {
    subdomain?: string;
}