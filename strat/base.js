'use strict';

const EventEmitter = require('events');

const common = root_require('common');
root_require('lib/show');

////////////////////
class StratBase extends EventEmitter {
    constructor(conf) {
        super();
        this.conf = conf;
    }

    static async create(conf) {
        conf.strat = common.parse(conf, 'strat', !null);

        console.log('Creating strat:', bold(conf.strat));
        conf.strat_func = common.local_require('strat', conf.strat);

        console.log('Initializing strat');
        conf.strat_func.init(conf);

        return new StratBase(conf);
    }

    ////////////////////
    advise(trades) {
        var advice = this.conf.strat_func.advise(trades);
        if(is_def(advice)) {
            advice.print();
            this.emit('advice', advice);
        }
    }
};

////////////////////
module.exports = StratBase;
