'use strict';

const TraderBase = require('./base');

class LiveTrader extends TraderBase {
    constructor(conf) {
        super();
    }

    accept(advice) {
        // do something
    }
};

module.exports = conf => new LiveTrader(conf);
