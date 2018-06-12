'use strict';

const _ = require('underscore');
const EventEmitter = require('events');

const common = root_require('common');
root_require('show');

class StratBase extends EventEmitter {
    constructor(conf) {
        super();

        this.conf = conf;
        common.parse(conf, 'strat', !null);

        console.log('Creating strat:', bold(conf.strat));
        conf.strat_func = common.local_require('strat', conf.strat);

        console.log('Initializing strat');
        conf.strat_func.init(conf);
    }

    advise(trades) {
        var advice = this.conf.strat_func.advise(trades);
        if(!_.isUndefined(advice)) {
            advice.print();
            this.emit('advice', advice);
        }
    }
};

module.exports = StratBase;
