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
        this.fetch = this.db.prepare(`SELECT timestamp, price, amount
            FROM data WHERE timestamp >= ? LIMIT 1000`
        );

        if(ccxt.exchanges.includes(this.exchange)) {
            var exch = new ccxt[this.exchange]();
            this.step = exch.rateLimit;
        }

        this.trades = [];
    }

    ////////////////////
    async fetch_trades(from, to) {
        for(;;) {
            var since = this.trades.length ? _.last(this.trades).timestamp + 1 : from;
            if(since > to) break;

            var trades = this.fetch.all(since);
            if(!trades.length) {
                common.sleep_for(this.step);
                break;
            }

            this.trades.push(...trades);
        }

        this.trades = this.trades.filter(trade => trade.timestamp >= from);
        return this.trades.filter(trade => trade.timestamp <= to);
    }
};

////////////////////
module.exports = conf => new CacheFeed(conf);
