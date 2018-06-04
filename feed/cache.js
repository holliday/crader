'use strict';

const FeedBase = require('./base');

class CacheFeed extends FeedBase {
    constructor(conf) {
        super();
    }
};

module.exports = conf => new CacheFeed(conf);
