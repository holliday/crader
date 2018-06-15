'use strict';

const as       = lib_require('as');
const Series   = lib_require('series');
const sleep    = lib_require('sleep');
const sqlite   = lib_require('sqlite');
const FeedBase = root_require('feed/base');

////////////////////
class CacheFeed extends FeedBase {
    constructor(conf) {
        super(conf); // captures conf
        this.trades = new Series();
    }

    static async create(conf) {
        console.log('Creating', as.bold('cache'), 'feed');

        conf.db_name = conf.exchange_name + '_' + conf.symbol.asset + '_' + conf.symbol.money;
        console.log('Opening cache database:', as.bold(conf.db_name));

        conf.db = new sqlite('cache/' + conf.db_name + '.sqlite');
        conf.db_fetch = conf.db.prepare(`SELECT timestamp, price, amount
            FROM data WHERE timestamp >= ? LIMIT 100000`
        );

        return new CacheFeed(conf);
    }

    ////////////////////
    async fetch_trades(from, to) {
        for(;;) {
            var since = this.trades.length ? this.trades.end().timestamp + 1 : from;
            if(since > to) break;

            var trades;
            for(;;) try {
                trades = this.conf.db_fetch.all(since);
                break;
            } catch(e) {
                console.error(e.message);
                await sleep.for(this.conf.step);
            }
            if(!trades.length) {
                await sleep.for(this.conf.step);
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
