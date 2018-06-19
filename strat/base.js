'use strict';

const EventEmitter = require('events');
const as           = lib_require('as');
const is           = lib_require('is');
const parse        = lib_require('parse');

////////////////////
class StratBase extends EventEmitter {
    constructor(conf) {
        super();
        this.conf = conf;
    }

    static async create(conf) {
        conf.strat_name = parse.any(conf, 'strat', !null);
        delete conf.strat;

        console.log('Creating strat:', as.bold(conf.strat_name));
        conf.strat = local_require('strat', conf.strat_name);

        console.log('Initializing strat');
        conf.strat.init(conf);

        return new StratBase(conf);
    }

    ////////////////////
    advise(trades) {
        var advice = this.conf.strat.advise(trades);
        if(is.def(advice) && is.fun(advice.print)) {
            advice.print(this.conf.symbol, this.conf.end_trade.price);
            this.emit('advice', advice);
        }
    }
};

////////////////////
module.exports = StratBase;
