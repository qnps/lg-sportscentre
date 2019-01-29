import moment = require('moment');

export interface Game {
    id: number;
    date: number | Date | moment.Moment;
    visitor: GameTeam;
    home: GameTeam;
}

export interface GameTeam {
    id: number;
    score?: number;
}