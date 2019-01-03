import Discord = require('discord.js');

import { Logger } from '../utils';

const DiscordClient = new Discord.Client();
export default DiscordClient;

process.on('exit', () => {
    DiscordClient
        .destroy()
        .then(err => {
            if (err) {
                Logger.error(err);
            }

            Logger.info('Closed connection to Discord');
        })
        .catch(err => {
            Logger.error(err);
        });
});