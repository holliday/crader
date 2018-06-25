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

        conf.max_buy = parse.float(conf, 'max_buy');
        if(isNaN(conf.max_buy)) conf.max_buy = 0.99;

        conf.max_sell = parse.float(conf, 'max_sell');
        if(isNaN(conf.max_sell)) conf.max_sell = 0.99;

        console.log('Trading settings:');
        console.log('  buy' , as.bold(as.pct(conf.max_buy , '-')));
        console.log('  sell', as.bold(as.pct(conf.max_sell, '-')));

        return new RealTrader(conf);
    }

    ////////////////////
    accept(advice) {
        // do something
    }
};

////////////////////
module.exports = RealTrader;
