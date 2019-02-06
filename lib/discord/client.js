const Discord = require('discord.js');

const { Logger } = require('../utils');

const DiscordClient = new Discord.Client();

process.on('exit', () => {
    DiscordClient
        .destroy()
        .then(() => Logger.info('Closed connection to Discord'))
        .catch((error) => {
            Logger.error(error);
        });
});

module.exports = DiscordClient;