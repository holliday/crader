'use strict';

const _ = require('underscore');
const ccxt = require('ccxt');

const FeedBase = root_require('feed/base');
root_require('show');

////////////////////
class LiveFeed extends FeedBase {
    constructor(conf) {
        super(conf);

        console.log('Creating', bold('live'), 'feed');

        if(!ccxt.exchanges.includes(this.exchange))
            throw new Error('Unspecified or invalid exchange');

        console.log('Creating exchange');
        this.exch = new ccxt[this.exchange]();
        this.exch.apiKey = conf.api_key;
        this.exch.secret = conf.secret;
        this.exch.enableRateLimit = true;
        this.step = this.exch.rateLimit;

        if(!this.exch.hasFetchTrades)
            throw new Error('Exchange does not provide trade data');

        this.trades = [];
    }

    ////////////////////
    async fetch_trades(from, to) {
        for(;;) {
            var since = this.trades.length ? _.last(this.trades).timestamp + 1 : from;
            if(since > to) break;

            var trades;
            for(;;) try {
                trades = await this.exch.fetchTrades(this.symbol, since);
                break;
            } catch (e) {
                console.error(e);
            }
            if(!trades.length) break;

            trades = trades.map(trade => ({
                timestamp: trade.timestamp,
                price: trade.price,
                amount: trade.amount,
            }));

            // remove duplicates
            while(this.trades.length
                && _.last(this.trades).timestamp >= trades[0].timestamp
            ) this.trades.pop();

            this.trades.push(...trades);
        }

        this.trades = this.trades.filter(trade => trade.timestamp >= from);
        return this.trades.filter(trade => trade.timestamp <= to);
    }
};

////////////////////
module.exports = conf => new LiveFeed(conf);
