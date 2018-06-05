'use strict';

const _ = require('underscore');
const EventEmitter = require('events');

class FeedBase extends EventEmitter {
    constructor(start, end, step, length) {
        super();

        this.start = start;
        this.end = end;
        this.step = step;
        this.length = length;
    }

    async fetch_trades(from, to) {
        return [];
    }

    //
    // Run from 'this.start' to 'this.end' timestamp with 'this.step' interval.
    // If 'this.start' is undefined, start in live mode.
    // If 'this.end' is undefined, run in live mode until stopped.
    //
    async run() {
        for(var now = _.isUndefined(this.start) ? Date.now() : this.start;
            !(now > this.end);
            now = Math.min(now + this.step, Date.now())
        ) this.emit('trades', await this.fetch_trades(now - this.length, now));
    }
};

module.exports = FeedBase;
