'use strict';

const _ = require('underscore');
const ccxt = require('ccxt');

const FeedBase = root_require('feed/base');
root_require('lib/show');

////////////////////
class LiveFeed extends FeedBase {
    constructor(conf) {
        super(conf); // captures conf
        this.trades = [];
    }

    static async create(conf) {
        console.log('Creating', bold('live'), 'feed');

        if(!ccxt.exchanges.includes(conf.exchange_name))
            throw new Error('Unspecified or invalid exchange');

        console.log('Creating exchange');
        conf.exchange = new ccxt[conf.exchange_name]();
        conf.exchange.apiKey = conf.api_key;
        conf.exchange.secret = conf.secret;

        conf.exchange.enableRateLimit = true;
        conf.step = conf.exchange.rateLimit;

        if(!conf.exchange.hasFetchTrades)
            throw new Error('Exchange does not provide trade data');

        await conf.exchange.loadMarkets();
        if(!conf.exchange.symbols.includes(conf.symbol.value))
            throw new Error('Invalid or unsupported symbol');

        return new LiveFeed(conf);
    }

    ////////////////////
    async fetch_trades(from, to) {
        for(;;) {
            var since = this.trades.length ? _.last(this.trades).timestamp + 1 : from;
            if(since > to) break;

            var trades;
            for(;;) try {
                trades = await this.conf.exchange.fetchTrades(this.conf.symbol.value, since);
                break;
            } catch(e) {
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
module.exports = LiveFeed;
