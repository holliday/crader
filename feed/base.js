'use strict';

const _ = require('underscore');
const EventEmitter = require('events');

const common = root_require('common');
root_require('show');

////////////////////
class FeedBase extends EventEmitter {
    constructor(conf) {
        super();

        this.exchange = common.parse_text(conf, 'exchange');
        console.log('Exchange:', bold(this.exchange));

        this.asset = common.parse_text(conf, 'asset');
        this.currency = common.parse_text(conf, 'currency');
        this.symbol = this.asset + '/' + this.currency;
        console.log('Symbol:', bold(this.symbol));

        this.frame = common.parse_period(conf, 'frame');
        this.count = common.parse_int(conf, 'count');
        console.log('Length:', bold(this.frame), 'x', bold(this.count));

        if('end' in conf) this.end = common.parse_date(conf, 'end');

        for(var name in conf)
            switch(name) {
                case 'start':
                    this.start = common.parse_date(conf, name);
                    break;

                case 'period':
                    this.start = ('end' in this ? this.end : Date.now()) -
                        common.parse_period(conf, 'period');
                    break;
            }

        if('end' in this && !('start' in this))
            throw new Error('Missing one of start or period');

        if('start' in this)
            console.log('Interval:',
                bold(as_date(new Date(this.start))),
                'to', 
                bold('end' in this ? as_date(new Date(this.end)) : '...')
            );

        this.step = 1000;
    }

    ////////////////////
    async fetch_trades(from, to) {
        return [];
    }

    ////////////////////
    //
    // Run from 'start' to 'end' timestamp with 'step' interval.
    // If 'start' is undefined, start in live mode.
    // If 'end' is undefined, run in live mode until stopped.
    //
    async run() {
        for(var now = ('start' in this) ? this.start : Date.now();
            !(now > this.end || this.stop);
            now = Math.min(now + this.step, Date.now())
        ) this.emit('trades', (await Promise.all([
            this.fetch_trades(now - this.frame * this.count, now),
            common.sleep_for(0), // allow Ctrl+C
        ]))[0]);
    }
};

////////////////////
module.exports = FeedBase;
