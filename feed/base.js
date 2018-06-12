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

    async fetch_trades(from, to) {
        return [];
    }

    async run() {
        var conf = this.conf;

        for(var now = _.isUndefined(conf.start) ? Date.now() : conf.start;
            !(now > conf.end || conf.stop);
            now = Math.min(now + conf.step, Date.now())

        ) this.emit('trades', (await Promise.all([
            this.fetch_trades(now - conf.frame * conf.count, now),
            common.sleep_for(0), // allow Ctrl+C
        ]))[0]);
    }
};

////////////////////
module.exports = FeedBase;
