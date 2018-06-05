'use strict';

const FeedBase = root_require('feed/base');

class CacheFeed extends FeedBase {
    constructor(conf) {
        super();
    }
};

module.exports = conf => new CacheFeed(conf);
