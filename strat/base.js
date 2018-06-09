'use strict';

const _ = require('underscore');
const EventEmitter = require('events');

const advice = root_require('advice');
root_require('show');

class StratBase extends EventEmitter {
    constructor(conf) {
        super();

        if(!('strat' in conf) || conf.strat === '')
            throw new Error('Unspecified or invalid strat');

        console.log('Creating strat:', bold(conf.strat));
        this.strat = require('./' + conf.strat);

        console.log('Initializing strat');
        this.strat.init(conf);
    }

    advise(trades) {
        if(_.isArray(trades)) {
            var adv = this.strat.advise(trades);
            if(advice.is_buy(adv) || advice.is_sell(adv)) this.emit('advice', adv);

        } else console.warn('Ignoring invalid trades');
    }
};

module.exports = conf => new StratBase(conf);
