'use strict';

const TraderBase = root_require('trader/base');

class LiveTrader extends TraderBase {
    constructor(conf) {
        super();
    }

    accept(advice) {
        // do something
    }
};

module.exports = conf => new LiveTrader(conf);
