const createEnum = require('./base');

module.exports.NewsItemType = createEnum({
    ACCOUNT: 'account',
    BID: 'bid',
    CONTRACT: 'contract',
    DRAFT: 'draft',
    NEWS: 'news',
    PROFILE: 'account',
    ROSTER: 'roster',
    TRADE: 'trade',
    WAIVER: 'waiver',
});