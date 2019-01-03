import moment = require('moment');

export interface Watcher {
    id: number;
    guild: number;
    type: number;
    league: number;
    team: number;
    channel: number;
    archived: number | Date | moment.Moment;
}

export interface WatcherType {
    id: number;
    name: string;
    description: string;
}