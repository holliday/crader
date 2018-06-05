'use strict';

const TraderBase = root_require('trader/base');

class PaperTrader extends TraderBase {
    constructor(conf) {
        super();
    }

    accept(advice) {
        // do something
    }
};

module.exports = conf => new PaperTrader(conf);
