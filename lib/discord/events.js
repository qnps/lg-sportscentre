const db = require('../db');
const { Logger } = require('../utils');

const client = require('./client');
const { parser, ...commands } = require('./commands');

client.on('disconnect', () => {
    Logger.warn('Lost connection to Discord');
    client.once('ready', () => Logger.info('Reconnected to Discord'));
});

client.on('error', (error) => {
    if (Object(error) === error) {
        if (/getaddrinfo ENOTFOUND/i.test(error.message)) {
            return Logger.error(`Could not connect to Discord: failed to resolve address ${error.message.replace(/.*? ENOTFOUND (\S+).*/, '$1')}`);
        } else if (err.message) {
            return Logger.error(`Could not connect to Discord: ${error.message}`);
        }
    }

    Logger.error(error);
});

client.on('guildCreate', (guild) =>
    db.createGuild(guild)
        .then((exists) => Logger.info(`${exists ? 'Rejoined' : 'Join'} guild ${guild.name} (id=${guild.id})`))
        .catch((error) => Logger.error(error.message)));

client.on('guildDelete', (guild) => 
    db.deleteGuild(guild)
        .then(() => Logger.info(`Left guild ${guild.name} (id=${guild.id})`))
        .catch((error) => Logger.error(error.message)));

client.on('message', (message) => {
    if (message.author.bot) {
        return;
    }
});

client.once('ready', () => {
    Logger.info(`Connected to Discord; active in ${client.guilds.size} ${client.guilds.size !== 1 ? 'guild' : 'guilds'}`);
    client.user.setActivity('Initializing...');
});

client.on('ready', () => {
    db.getGuilds()
        .then((guilds) => {
            const guildIds = guilds.map((guild) => guild.id);
            const activeGuildIds = client.guilds.map((guild) => guild.id);
            let archived = 0;

            for (const guild of guilds) {
                if (activeGuildIds.includes(guild.id)) {
                    continue;
                }

                client.emit('guildDelete', guild);
                archived++;
            }

            (archived > 0) && Logger.info(`${archived} ${archived !== 1 ? 'guild' : 'guilds'} have been automatically archived`);

            for (const [id, guild] of client.guilds) {
                guildIds.includes(id) || client.emit('guildCreate', guild);
            }
        })
        .catch((error) => Logger.error(error.message));
});

client.once('ready', () => client.user.setActivity('v3.0.0 BETA'));