'use strict';

const _ = require('underscore');

const advice = root_require('lib/advice');
const common = root_require('common');
root_require('lib/show');
const trade = root_require('lib/trade');
const TraderBase = root_require('trader/base');

////////////////////
class PaperTrader extends TraderBase {
    constructor(conf) {
        super(conf); // captures conf
    }

    static async create(conf) {
        console.log('Creating', bold('paper'), 'trader');

        conf.init_asset = common.parse_float(conf, 'asset');
        if(isNaN(conf.init_asset)) conf.init_asset = 0;
        conf.asset = conf.init_asset;

        conf.init_money = common.parse_float(conf, 'money');
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

        } else console.log('Not selling due to lack of assets');

        console.log();
    }
}

////////////////////
module.exports = PaperTrader;
