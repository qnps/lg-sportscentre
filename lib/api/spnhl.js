const moment = require('moment-timezone');

const { Team } = require('../utils');

const BaseApi = require('./base');

module.exports = class SpnhlApi extends BaseApi {
    constructor(options = {}) {
        super(options);

        this.getGames = this.getGames.bind(this);
        this.getTeams = this.getTeams.bind(this);
        this.url = this.url.bind(this);
    }

    static create(options) {
        return new SpnhlApi(options);
    }

    getGames() {
        return this.get(this.url('schedule.php'))
            .then((games) =>
                games.map((game) => ({
                    ...game,
                    date: moment(game.date).toDate(),
                }))
            );
    }

    getTeams() {
        return this.get(this.url('teams.php'))
            .then((data) =>
                data.reduce((teams, team) => ({
                    ...teams,
                    [team.id]: {
                        id: parseInt(team.id),
                        ...Team.from(team.abbrev)
                    }
                }), {})
            );
    }

    url(file) {
        return `https://thespnhl.com/api/${file}`;
    }
};