'use strict';

const TraderBase = root_require('trader/base');

class RealTrader extends TraderBase {
    constructor(conf) {
        super();
        console.log('Creating', bold('real'), 'trader');
    }

    accept(advice) {
        // do something
    }
};

module.exports = conf => new RealTrader(conf);