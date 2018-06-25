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
        console.log('Creating', as.bold('paper'), 'trader');

        conf.start_asset = parse.float(conf, 'start_asset');
        if(isNaN(conf.start_asset)) conf.start_asset = 0;
        conf.asset = conf.start_asset;

        conf.start_money = parse.float(conf, 'start_money');
        if(isNaN(conf.start_money)) conf.start_money = 0;
        conf.money = conf.start_money;

        conf.max_buy = parse.float(conf, 'max_buy');
        if(isNaN(conf.max_buy)) conf.max_buy = 0.99;

        conf.max_sell = parse.float(conf, 'max_sell');
        if(isNaN(conf.max_sell)) conf.max_sell = 0.99;

        conf.fee = parse.float(conf, 'fee');
        if(isNaN(conf.fee)) conf.fee = 0;

        conf.slippage = parse.float(conf, 'slippage');
        if(isNaN(conf.slippage)) conf.slippage = 0;

        console.log('Paper trading settings:');
        console.log('  buy'     , as.bold(as.pct(conf.max_buy , '-')));
        console.log('  sell'    , as.bold(as.pct(conf.max_sell, '-')));
        console.log('  fee'     , as.bold(as.pct(conf.fee     , '-')));
        console.log('  slippage', as.bold(as.pct(conf.slippage, '-')));

        if(conf.start_asset < 0.0001 && conf.start_money < 0.0001)
            console.log(as.bg_yellow('You are broke!'));
        this.print_start_balance();
    }

    static async create(conf) {
        return new PaperTrader(conf);
    }

    ////////////////////
    accept(advice) {
        if(advice.is_buy()) this.buy(advice);
        else if(advice.is_sell()) this.sell(advice);
    }

    ////////////////////
    buy(advice) {
        if(this.conf.money >= 0.0001) {
            var price = this.conf.end_trade.price * (1 + this.conf.slippage);
            var money = this.conf.money * this.conf.max_buy;
            var asset = money / price;

            this.conf.money -= money * (1 + this.conf.fee);
            this.conf.asset += asset;

            this.add_trade(Trade.buy(this.conf.end_trade.timestamp, asset, price));

        } else console.warn('Not buying due to lack of currency');

        console.log();
    }

    ////////////////////
    sell(advice) {
        if(this.conf.asset >= 0.0001) {
            var price = this.conf.end_trade.price * (1 - this.conf.slippage);
            var asset = this.conf.asset * this.conf.max_sell;
            var money = asset * price;

            this.conf.asset -= asset;
            this.conf.money += money * (1 - this.conf.fee);

            this.add_trade(Trade.sell(this.conf.end_trade.timestamp, asset, price));

        } else console.warn('Not selling due to lack of assets');

        console.log();
    }
}

////////////////////
module.exports = PaperTrader;
