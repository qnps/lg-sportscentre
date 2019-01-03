export class Team {
    public readonly city: string;
    public readonly shortName: string;
    public readonly name: string;

    private static readonly NHL: object = {
        'ANA': new Team('Anaheim', 'Ducks'),
        'ARI': new Team('Arizona', 'Coyotes'),
        'BOS': new Team('Boston', 'Bruins'),
        'BUF': new Team('Buffalo', 'Sabres'),
        'CAR': new Team('Carolina', 'Hurricanes'),
        'CBJ': new Team('Columbus', 'Blue Jackets'),
        'CGY': new Team('Calgary', 'Flames'),
        'CHI': new Team('Chicago', 'Blackhawks'),
        'COL': new Team('Colorado', 'Avalanche'),
        'DAL': new Team('Dallas', 'Stars'),
        'DET': new Team('Detroit', 'Red Wings'),
        'EDM': new Team('Edmonton', 'Oilers'),
        'FLA': new Team('Florida', 'Panthers'),
        'LA' : new Team('Los Angeles', 'Kings'),
        'LAK': new Team('Los Angeles', 'Kings'),
        'MIN': new Team('Minnesota', 'Wild'),
        'MTL': new Team('Montreal', 'Canadiens'),
        'NJ' : new Team('New Jersey', 'Devils'),
        'NJD': new Team('New Jersey', 'Devils'),
        'NSH': new Team('Nashville', 'Predators'),
        'NYI': new Team('New York', 'Islanders'),
        'NYR': new Team('New York', 'Rangers'),
        'OTT': new Team('Ottawa', 'Senators'),
        'PHI': new Team('Philadelphia', 'Flyers'),
        'PIT': new Team('Pittsburgh', 'Penguins'),
        'SJ' : new Team('San Jose', 'Sharks'),
        'SJS': new Team('San Jose', 'Sharks'),
        'STL': new Team('St. Louis', 'Blues'),
        'TB' : new Team('Tampa Bay', 'Lightning'),
        'TBL': new Team('Tampa Bay', 'Lightning'),
        'TOR': new Team('Toronto', 'Maple Leafs'),
        'VAN': new Team('Vancouver', 'Canucks'),
        'VGK': new Team('Vegas', 'Golden Knights'),
        'WPG': new Team('Winnipeg', 'Jets'),
        'WSH': new Team('Washington', 'Capitals'),
    };

    private constructor(city: string, name: string) {
        this.city = city;
        this.shortName = name;
        this.name = `${city} ${name}`;
    }

    public static from(value: string): Team {
        value = `${value}`.trim();

        if (Team.NHL[value]) {
            return Team.NHL[value];
        }

        const regex: RegExp = new RegExp(value, 'i');

        for (const team of Object.values(Team.NHL)) {
            if (regex.test(team.city) || regex.test(team.shortName) || regex.test(team.name)) {
                return team;
            }
        }
    }
}

export default Team;