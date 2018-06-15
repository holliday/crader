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
        conf.strat = parse.any(conf, 'strat', !null);

        console.log('Creating strat:', as.bold(conf.strat));
        conf.strat_func = local_require('strat', conf.strat);

        console.log('Initializing strat');
        conf.strat_func.init(conf);

        return new StratBase(conf);
    }

    ////////////////////
    advise(trades) {
        var advice = this.conf.strat_func.advise(trades);
        if(is.def(advice)) {
            advice.print();
            this.emit('advice', advice);
        }
    }
};

////////////////////
module.exports = StratBase;
