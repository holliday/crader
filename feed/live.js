'use strict';

const FeedBase = require('./base');

class LiveFeed extends FeedBase {
    constructor(conf) {
        super();
    }

    async run() {
        return new Promise();
    }
};

module.exports = conf => new LiveFeed(conf);
