'use strict';

const _ = require('underscore');
const EventEmitter = require('events');

const common = root_require('common');

////////////////////
class FeedBase extends EventEmitter {
    constructor(conf) {
        super();

        this.conf = conf;
        this.conf.stop = false;
        this.conf.step = 1000;
    }

    static async create(conf) {
        return new FeedBase(conf);
    }

    ////////////////////
    async fetch_trades(from, to) {
        return [];
    }

    ////////////////////
    async run() {
        for(var now = _.isUndefined(this.conf.start) ? Date.now() : this.conf.start;
            !(now > this.conf.end || this.conf.stop);
            now = Math.min(now + this.conf.step, Date.now())
        ) {
            var trades = (await Promise.all([
                this.fetch_trades(now - this.conf.frame * this.conf.count, now),
                common.sleep_for(0), // allow Ctrl+C
            ]))[0];

            if(trades.length) {
                if(_.isUndefined(this.conf.init_price))
                    this.conf.init_price = trades[0].price;
                this.conf.price = _.last(trades).price;
            }
            this.emit('trades', trades);
        }
    }
};

////////////////////
module.exports = FeedBase;
