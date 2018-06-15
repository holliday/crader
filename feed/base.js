'use strict';

const EventEmitter = require('events');
const Series = root_require('lib/series');

////////////////////
class FeedBase extends EventEmitter {
    constructor(conf) {
        super();
        this.conf = conf;

        conf.step = 1000;
        conf.stop = false;

        this.time = is_def(conf.start) ? conf.start : Date.now();
    }

    static async create(conf) {
        return new FeedBase(conf);
    }

    ////////////////////
    async fetch_trades(from, to) {
        return new Series();
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
            if(!is_def(this.conf.init_price))
                this.conf.init_price = trades[0].price;
            this.conf.price = trades.end().price;
        }
        this.emit('trades', trades);

        this.time = Math.min(this.time + this.conf.step, Date.now());
        setImmediate(this.run.bind(this));
    }
};

////////////////////
module.exports = FeedBase;
