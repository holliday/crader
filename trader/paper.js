'use strict';

const TraderBase = require('./base');

class PaperTrader extends TraderBase {
    constructor(conf) {
        super();
    }

    accept(advice) {
        // do something
    }
};

module.exports = conf => new PaperTrader(conf);
