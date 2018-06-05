'use strict';

const binance = require('binance');

const common = require('../common');
const FeedBase = require('./base');
require('../show');

const rate_limit = 1000;

class LiveFeed extends FeedBase {
    constructor(exchange, symbol, frame, count, start, end) {
        super(start, end, rate_limit, frame * count);

        this.exchange = exchange;
        this.symbol = symbol;
        this.frame = frame;
        this.count = count;

        this.trades = [];
        this.next_fetch = Date.now();
    }

    async fetch_trades(from, to) {
        for(;;) {
            var since = this.trades.length
                ? this.trades[this.trades.length - 1].timestamp
                : from;
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
                && this.trades[this.trades.length - 1].timestamp >= trades[0].timestamp
            ) this.trades.pop();

            this.trades.push(...trades);
        }

        this.trades = this.trades.filter(trade => trade.timestamp >= from);
        return this.trades.filter(trade => trade.timestamp <= to);
    }

    static create(conf) {
        console.log('Creating live feed');

        console.log('Creating exchange');
        var exchange = new binance.BinanceRest({
            key: conf.api_key,
            secret: conf.secret,
        });

        var symbol = conf.asset + conf.currency;
        if(typeof symbol === 'undefined' || symbol === '')
            throw new Error('Unspecified of invalid asset and/or currency');
        console.log('Symbol:', bold(symbol));

        var frame = common.period(conf.frame);
        if(!(frame >= 1000)) throw new Error('Unspecified or invalid frame');

        var count = parseInt(conf.count);
        if(!(count >= 1)) throw new Error('Unspecified or invalid count');

        console.log('Length:', bold(frame), 'x', bold(count));

        var end;
        if(typeof conf.end !== 'undefined') {
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
                    var period = common.period(conf.period);
                    if(isNaN(period)) throw new Error('Invalid period');
                    start = (typeof end === 'undefined' ?  Date.now() : end) - period;
                    break;
            }

        if(typeof end !== 'undefined' && typeof start === 'undefined')
            throw new Error('Missing one of start or period');

        if(typeof start !== 'undefined')
            console.log('Interval:',
                bold(date(new Date(start))),
                'to', 
                bold(typeof end === 'undefined' ? '...' : date(new Date(end)))
            );

        return new LiveFeed(exchange, symbol, frame, count, start, end);
    }
};

module.exports = conf => LiveFeed.create(conf);
