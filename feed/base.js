'use strict';

const EventEmitter = require('events');
const is           = lib_require('is');
const Series       = lib_require('series');

////////////////////
class FeedBase extends EventEmitter {
    constructor(conf) {
        super();

        global.now = is.def(conf.start) ? conf.start : Date.now();
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

        if(global.now > conf.end || conf.stop) {
            this.emit('done');
            return;
        }

        var trades = await this.fetch_trades(
            global.now - conf.frame * conf.count, global.now
        );

        if(trades.length) {
            if(is.undef(conf.start_trade))
                conf.start_trade = trades[0];
            conf.end_trade = trades.end();
        }
        this.emit('trades', trades);

        global.now = Math.min(global.now + conf.step, Date.now());
        setImmediate(this.run.bind(this));
    }
};

////////////////////
module.exports = FeedBase;
