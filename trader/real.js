'use strict';

const as         = lib_require('as');
const TraderBase = root_require('trader/base');

////////////////////
class RealTrader extends TraderBase {
    constructor(conf) {
        super(conf); // captures conf
    }

    static async create(conf) {
        console.log('Creating', as.bold('real'), 'trader');

        return new RealTrader(conf);
    }

    ////////////////////
    accept(advice) {
        // do something
    }
};

////////////////////
module.exports = RealTrader;
