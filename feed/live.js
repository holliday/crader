'use strict';

const FeedBase = require('./base');

class LiveFeed extends FeedBase {
    constructor(conf) {
        super();
    }
};

module.exports = conf => new LiveFeed(conf);
