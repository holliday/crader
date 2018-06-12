'use strict';

const _ = require('underscore');

const common = root_require('common');
const FeedBase = root_require('feed/base');
root_require('show');
const sqlite = root_require('sqlite3');

////////////////////
class CacheFeed extends FeedBase {
    constructor(conf) {
        super(conf); // captures conf
        this.trades = [];
    }

    static async create(conf) {
        console.log('Creating', bold('cache'), 'feed');

        conf.db_name = conf.exchange_name + '_' + conf.symbol.replace('/', '_');
        console.log('Opening cache database:', bold(conf.db_name));

        conf.db = new sqlite('cache/' + conf.db_name + '.sqlite', { readonly: true });
        conf.db_fetch = conf.db.prepare(`SELECT timestamp, price, amount
            FROM data WHERE timestamp >= ? LIMIT 100000`
        );

        return new CacheFeed(conf);
    }

    ////////////////////
    async fetch_trades(from, to) {
        for(;;) {
            var since = this.trades.length ? _.last(this.trades).timestamp + 1 : from;
            if(since > to) break;

            var trades;
            for(;;) try {
                trades = this.conf.db_fetch.all(since);
                break;
            } catch(e) {
                console.error(e);
                await common.sleep_for(this.conf.step);
            }
            if(!trades.length) {
                await common.sleep_for(this.conf.step);
                break;
            }

            this.trades.push(...trades);
        }

        this.trades = this.trades.filter(trade => trade.timestamp >= from);
        return this.trades.filter(trade => trade.timestamp <= to);
    }
};

////////////////////
module.exports = CacheFeed;
