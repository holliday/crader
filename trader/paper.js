'use strict';

const Advice     = lib_require('advice');
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
        if(Advice.is_buy(advice)) this.buy(advice);
        else if(Advice.is_sell(advice)) this.sell(advice);
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
            var trade_ = this.conf.end_trade;

            var asset = this.conf.money * 0.99 / trade_.price;
            var money = asset * trade_.price;

            this.conf.money -= money;
            this.conf.asset += asset;

            this._add_trade(trade.buy(trade_.timestamp, this.conf.symbol, asset, trade_.price));
            this.price_buy = trade_.price;

        } else console.warn('Not buying due to lack of currency');

        console.log();
    }

    ////////////////////
    sell(advice) {
        if(this.conf.asset >= 0.0001) {
            var trade_ = this.conf.end_trade;

            var asset = this.conf.asset * 0.99;
            var money = asset * trade_.price;

            this.conf.money += money;
            this.conf.asset -= asset;

            this._add_trade(trade.sell(trade_.timestamp, this.conf.symbol, asset, trade_.price));

        } else console.warn('Not selling due to lack of assets');

        console.log();
    }
}

////////////////////
module.exports = PaperTrader;
