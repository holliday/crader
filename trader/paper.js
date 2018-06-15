'use strict';

const advice     = lib_require('advice');
const as         = lib_require('as');
const parse      = lib_require('parse');
const trade      = lib_require('trade');
const TraderBase = root_require('trader/base');

////////////////////
class PaperTrader extends TraderBase {
    constructor(conf) {
        super(conf); // captures conf
    }

    static async create(conf) {
        console.log('Creating', as.bold('paper'), 'trader');

        conf.init_asset = parse.float(conf, 'asset');
        if(isNaN(conf.init_asset)) conf.init_asset = 0;
        conf.asset = conf.init_asset;

        conf.init_money = parse.float(conf, 'money');
        if(isNaN(conf.init_money)) conf.init_money = 0;
        conf.money = conf.init_money;

        return new PaperTrader(conf);
    }

    ////////////////////
    accept(advice_) {
        if(advice.is_buy(advice_)) this.buy(advice_);
        else if(advice.is_sell(advice_)) this.sell(advice_);
    }

    ////////////////////
    _add_trade(trade) {
        this.trades.push(trade);

        console.log('Executed trade:');
        trade.print(this.price_buy);

        this.print_balance();
    }

    ////////////////////
    buy(advice) {
        if(this.conf.money >= 0.01) {
            var asset = this.conf.money * 0.99 / advice.price;
            var money = asset * advice.price;

            this.conf.money -= money;
            this.conf.asset += asset;

            this._add_trade(trade.buy(advice.timestamp, advice.symbol, asset, advice.price));
            this.price_buy = advice.price;

        } else console.warn('Not buying due to lack of currency');

        console.log();
    }

    ////////////////////
    sell(advice) {
        if(this.conf.asset >= 0.0001) {
            var asset = this.conf.asset * 0.99;
            var money = asset * advice.price;

            this.conf.money += money;
            this.conf.asset -= asset;

            this._add_trade(trade.sell(advice.timestamp, advice.symbol, asset, advice.price));

        } else console.warn('Not selling due to lack of assets');

        console.log();
    }
}

////////////////////
module.exports = PaperTrader;
