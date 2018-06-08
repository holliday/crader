'use strict';

const _ = require('underscore');
const ccxt = require('ccxt');

const common = root_require('common');
const FeedBase = root_require('feed/base');
root_require('show');
const sqlite = root_require('sqlite3');

////////////////////
class CacheFeed extends FeedBase {
    constructor(conf) {
        super(conf);

        console.log('Creating', bold('cache'), 'feed');

        const name = this.exchange + '_' + this.asset + '_' + this.currency;

        console.log('Opening cache database:', bold(name));
        this.db = new sqlite('cache/' + name + '.sqlite', { readonly: true });

        this.stmt = this.db.prepare(`SELECT timestamp, price, amount
            FROM data WHERE timestamp >= ? AND timestamp <= ?`
        );

        if(ccxt.exchanges.includes(this.exchange)) {
            var exch = new ccxt[this.exchange]();
            this.step = exch.rateLimit;
        }
    }

    ////////////////////
    async fetch_trades(from, to) {
        var trades = this.stmt.all(from, to);
        if(!trades.length) common.sleep_for(this.step);

        return trades;
    }
};

////////////////////
module.exports = conf => new CacheFeed(conf);
