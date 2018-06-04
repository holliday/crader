'use strict';

const FeedBase = require('./base');

class CacheFeed extends FeedBase {
    constructor(conf) {
        super();
    }

    async run() {
        return new Promise();
    }
};

module.exports = conf => new CacheFeed(conf);
