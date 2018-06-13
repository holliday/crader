'use strict';

const _ = require('underscore');
const EventEmitter = require('events');

root_require('lib/show');
const trade = root_require('lib/trade');

////////////////////
class TraderBase extends EventEmitter {
    constructor(conf) {
        super();

        this.conf = conf;

        if(this.conf.init_asset < 0.0001 && this.conf.init_money < 0.01)
            console.log(bg_yellow('You are broke!'));
        this.print_init_balance();

        this.trades = [];
    }

    static async create(conf) {
        return new TraderBase(conf);
    }

    ////////////////////
    accept(advice) {
        // do nothing
    }

    ////////////////////
    _print_balance(type, asset, money) {
        console.log(type, 'balance:',
            this.conf.symbol.as_asset(), as_vol(asset, '-').trim(),
            this.conf.symbol.as_money(), as_price(money, '-').trim()
        );
    }

    print_init_balance() {
        this._print_balance('Starting', this.conf.init_asset, this.conf.init_money);
    }

    print_balance(type = 'Current') {
        this._print_balance(type, this.conf.asset, this.conf.money);
    }

    ////////////////////
    print_trades() {
        console.log('Trades:');

        var price_buy;
        this.trades.forEach(trade_ => {
            if(trade.is_buy(trade_)) {
                price_buy = trade_.price;
                trade_.print();

            } else if(trade.is_sell(trade_))
                trade_.print(price_buy);
        });

        console.log();
    }

    ////////////////////
    print_performance() {
        console.log('Performance:');
    }

    ////////////////////
    print_summary() {
        console.log(
`


----=[ Summary ]=---------------------------------------------------------------
`
        );

        if(this.trades.length) {
            this.print_init_balance();
            this.print_trades();
        }
        this.print_balance('Ending');
        this.print_performance();
    }
};

////////////////////
module.exports = TraderBase;
