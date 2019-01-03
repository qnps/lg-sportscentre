import moment = require('moment');

export interface Admin {
    guild: number;
    member: number;
}

export interface Guild {
    id: number;
    archived: number | Date | moment.Moment;
}