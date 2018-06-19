'use strict';

const EventEmitter = require('events');
const is           = lib_require('is');
const Series       = lib_require('series');

////////////////////
class FeedBase extends EventEmitter {
    constructor(conf) {
        super();

        conf.time = is.def(conf.start) ? conf.start : Date.now();
        conf.step = 1000;
        conf.stop = false;

        this.conf = conf;
    }

    ////////////////////
    async fetch_trades(from, to) {
        return new Series();
    }

    ////////////////////
    async run() {
        var conf = this.conf;

        if(conf.time > conf.end || conf.stop) {
            this.emit('done');
            return;
        }

        var trades = await this.fetch_trades(
            conf.time - conf.frame * conf.count, conf.time
        );

        if(trades.length) {
            if(is.undef(conf.init_price))
                conf.init_price = trades[0].price;
            conf.price = trades.end().price;
        }
        this.emit('trades', trades);

        conf.time = Math.min(conf.time + conf.step, Date.now());
        setImmediate(this.run.bind(this));
    }
};

////////////////////
module.exports = FeedBase;
