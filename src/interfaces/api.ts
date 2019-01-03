import { DailyStars } from './daily-stars';
import { Game } from './games';
import { League } from './leagues';
import { NewsItem } from './news';
import { TeamList } from './teams';

export interface Api {
    getGames(...params: any): Promise<Array<Game>>;
    getTeams(...params: any): Promise<TeamList>;
}

export interface ApiOptions {
    defaultTimezone?: string;
}

export interface ExtendedApi extends Api {
    getDailyStars(...params: any): Promise<DailyStars>;
    getInfo(...params: any): Promise<League>;
    getNews(...params: any): Promise<Array<NewsItem>>;
}