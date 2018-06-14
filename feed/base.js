'use strict';

const _ = require('underscore');
const EventEmitter = require('events');

////////////////////
class FeedBase extends EventEmitter {
    constructor(conf) {
        super();
        this.conf = conf;

        conf.step = 1000;
        conf.stop = false;

        this.time = _.isUndefined(conf.start) ? Date.now() : conf.start;
        this.trades = [];
    }

    static async create(conf) {
        return new FeedBase(conf);
    }

    ////////////////////
    async fetch_trades(from, to) {
        return this.trades;
    }

    ////////////////////
    async run() {
        if(this.time > this.conf.end || this.conf.stop) {
            this.emit('done');
            return;
        }

        var trades = await this.fetch_trades(
            this.time - this.conf.frame * this.conf.count,
            this.time
        );

        if(trades.length) {
            if(_.isUndefined(this.conf.init_price))
                this.conf.init_price = trades[0].price;
            this.conf.price = _.last(trades).price;
        }
        this.emit('trades', trades);

        this.time = Math.min(this.time + this.conf.step, Date.now());
        setImmediate(this.run.bind(this));
    }
};

////////////////////
module.exports = FeedBase;
