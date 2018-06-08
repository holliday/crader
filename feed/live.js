'use strict';

const _ = require('underscore');
const ccxt = require('ccxt');

const common = root_require('common');
const FeedBase = root_require('feed/base');
root_require('show');

////////////////////
class LiveFeed extends FeedBase {
    constructor(exchange, symbol, start, end, length) {
        super(start, end, exchange.rateLimit, length);

        this.exchange = exchange;
        this.symbol = symbol;

        this.trades = [];
    }

    ////////////////////
    static create(conf) {
        console.log('Creating', bold('live'), 'feed');

        if(!ccxt.exchanges.includes(conf.exchange))
            throw new Error('Unspecified or invalid exchange');

        console.log('Creating exchange:', bold(conf.exchange));
        var exchange = new ccxt[conf.exchange]();

        exchange.apiKey = conf.api_key;
        exchange.secret = conf.secret;
        exchange.enableRateLimit = true;

        if(!exchange.hasFetchTrades)
            throw new Error('Exchange does not provide trade data');

        var asset = common.parse_text(conf, 'asset');
        var currency = common.parse_text(conf, 'currency');

        var symbol = asset + '/' + currency;
        console.log('Symbol:', bold(symbol));

        exchange.loadMarkets().then(() => {
            if(!exchange.symbols.includes(symbol))
                throw new Error('Unsupported symbol ' + symbol);
        });

        var frame = common.parse_period(conf, 'frame');
        var count = common.parse_int(conf, 'count');
        console.log('Length:', bold(frame), 'x', bold(count));

        var end;
        if(!_.isUndefined(conf.end)) {
            end = (new Date(conf.end)).getTime();
            if(isNaN(end)) throw new Error('Invalid end time');
        }

        var start;
        for(var name in conf)
            switch(name) {
                case 'start':
                    start = (new Date(conf.start)).getTime();
                    if(isNaN(start)) throw new Error('Invalid start time');
                    break;

                case 'period':
                    var period = common.parse_period(conf, 'period');
                    start = (_.isUndefined(end) ?  Date.now() : end) - period;
                    break;
            }

        if(!_.isUndefined(end) && _.isUndefined(start))
            throw new Error('Missing one of start or period');

        if(!_.isUndefined(start))
            console.log('Interval:',
                bold(as_date(new Date(start))),
                'to', 
                bold(_.isUndefined(end) ? '...' : as_date(new Date(end)))
            );

        return new LiveFeed(exchange, symbol, start, end, frame * count);
    }

    ////////////////////
    async fetch_trades(from, to) {
        for(;;) {
            var since = this.trades.length ? _.last(this.trades).timestamp + 1 : from;
            if(since > to) break;

            var trades;
            for(;;) try {
                trades = await this.exchange.fetchTrades(this.symbol, since);
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
module.exports = conf => LiveFeed.create(conf);
