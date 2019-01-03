import moment = require('moment');

import { NewsItemType } from '../enums';

export interface NewsItem {
    message: string;
    teams?: Array<number>;
    timestamp: number | Date | moment.Moment;
    type: NewsItemType;
}