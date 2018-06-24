'use strict';

const Advice     = lib_require('advice');
const as         = lib_require('as');
const parse      = lib_require('parse');
const Trade      = lib_require('trade');
const TraderBase = root_require('trader/base');

////////////////////
class PaperTrader extends TraderBase {
    constructor(conf) {
        super(conf); // captures conf
    }

    static async create(conf) {
        console.log('Creating', as.bold('paper'), 'trader');

        conf.start_asset = parse.float(conf, 'asset');
        if(isNaN(conf.start_asset)) conf.start_asset = 0;
        conf.asset = conf.start_asset;

        conf.start_money = parse.float(conf, 'money');
        if(isNaN(conf.start_money)) conf.start_money = 0;
        conf.money = conf.start_money;

        return new PaperTrader(conf);
    }

    ////////////////////
    accept(advice) {
        if(advice.is_buy()) this.buy(advice);
        else if(advice.is_sell()) this.sell(advice);
    }

    ////////////////////
    buy(advice) {
        if(this.conf.money >= 0.01) {
            var trade = this.conf.end_trade;
            var asset = this.conf.money * 0.99 / trade.price;
            this.add_trade(Trade.buy(trade.timestamp, asset, trade.price));

        } else console.warn('Not buying due to lack of currency');

        console.log();
    }

    ////////////////////
    sell(advice) {
        if(this.conf.asset >= 0.0001) {
            var trade = this.conf.end_trade;
            var asset = this.conf.asset * 0.99;

            this.add_trade(Trade.sell(trade.timestamp, asset, trade.price));

        } else console.warn('Not selling due to lack of assets');

        console.log();
    }
}

////////////////////
module.exports = PaperTrader;
