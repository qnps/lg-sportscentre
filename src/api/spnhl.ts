import moment = require('moment-timezone');

import { Api, ApiOptions, Game, TeamList } from '../types';
import { Team } from '../utils';

import BaseApi from './base';

export default class SpnhlApi extends BaseApi implements Api {
    public constructor(options: ApiOptions = {}) {
        super(options);

        this.url = this.url.bind(this);
        this.getGames = this.getGames.bind(this);
        this.getTeams = this.getTeams.bind(this);
    }

    public static create(options?: ApiOptions): SpnhlApi {
        return new SpnhlApi(options);
    }

    private url(file: string): string {
        return `https://thespnhl.com/api/${file}`;
    }

    public getGames(): Promise<Array<Game>> {
        return this.get(this.url('schedule.php'))
            .then((games: Array<Game>) =>
                games.map((game: Game) => {
                    game.id = parseInt(`${game.id}`);
                    game.date = moment(game.date).toDate();
                    (game.visitor.score !== null) && (game.visitor.score = parseInt(`${game.visitor.score}`));
                    (game.home.score !== null) && (game.home.score = parseInt(`${game.home.score}`));
                    return game;
                })
            );
    }

    public getTeams(): Promise<TeamList> {
        return this.get(this.url('teams.php'))
            .then((data: Array<SpnhlTeam>) =>
                data.reduce((teams: TeamList, team: SpnhlTeam) => ({
                    ...teams,
                    [team.id]: {
                        id: parseInt(team.id),
                        ...Team.from(team.abbrev)
                    }
                }), {})
            );
    }
}

interface SpnhlTeam {
    id: string;
    abbrev: string;
}