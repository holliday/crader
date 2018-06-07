'use strict';

const _ = require('underscore');
const binance = require('binance');

const common = root_require('common');
const FeedBase = root_require('feed/base');
root_require('show');

const rate_limit = 1000;

class LiveFeed extends FeedBase {
    constructor(exchange, symbol, length, start, end) {
        super(start, end, rate_limit, length);

        this.exchange = exchange;
        this.symbol = symbol;

        this.trades = [];
        this.next_fetch = Date.now();
    }

    async fetch_trades(from, to) {
        for(;;) {
            var since = this.trades.length ? _.last(this.trades).timestamp : from;
            if(since > to) break;

            for(;;) try {
                // rate limit
                await common.sleep_until(this.next_fetch);
                this.next_fetch = Date.now() + rate_limit;

                var trades = await this.exchange.aggTrades({
                    symbol: this.symbol,
                    startTime: since,
                    endTime: since + 60 * 60 * 1000,
                });
                break;

            } catch (e) {
                console.error(e);
            }
            if(!trades.length) break;

            trades = trades.map(trade => ({
                timestamp: trade.timestamp,
                price: parseFloat(trade.price),
                quantity: parseFloat(trade.quantity),
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

    static create(conf) {
        console.log('Creating', bold('live'), 'feed');

        console.log('Creating exchange');
        var exchange = new binance.BinanceRest({
            key: conf.api_key,
            secret: conf.secret,
        });

        var symbol = conf.asset + conf.currency;
        if(_.isUndefined(symbol) || symbol === '')
            throw new Error('Unspecified or invalid asset and/or currency');
        console.log('Symbol:', bold(symbol));

        var frame = common.parse_period(conf, 'frame');
        var count = common.parse_int(conf, 'count');

        console.log('Length:', bold(frame), 'x', bold(count));

        var end;
        if(!_.isUndefined(conf.end)) {
            end = Date.parse(conf.end);
            if(isNaN(end)) throw new Error('Invalid end time');
        }

        var start;
        for(var name in conf)
            switch(name) {
                case 'start':
                    start = Date.parse(conf.start);
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

        return new LiveFeed(exchange, symbol, frame * count, start, end);
    }
};

module.exports = conf => LiveFeed.create(conf);
