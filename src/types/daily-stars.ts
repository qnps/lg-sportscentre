export interface DailyStar {
    rank: number;
    team: number;
    name: string;
    position: string;
    data: DailyStarGoalieData | DailyStarSkaterData;
}

export interface DailyStarGoalieData {
    shots: number;
    saves: number;
    svPct: number;
    gaa: number;
}

export interface DailyStarSkaterData {
    goals: number;
    assists: number;
    points: number;
    plusMinus: number;
}

export interface DailyStars {
    forwards: Array<DailyStar>;
    defenders: Array<DailyStar>;
    goalies: Array<DailyStar>;
}