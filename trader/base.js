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
        console.log(type);
        console.log(
            this.conf.symbol.as_asset(), as_vol(asset, '-'),
            this.conf.symbol.as_money(), as_price(money, '-')
        );
    }

    print_init_balance() {
        this._print_balance('Starting balance:',
            this.conf.init_asset, this.conf.init_money
        );
        console.log();
    }

    print_balance() {
        this._print_balance(bold('Current balance:'),
            this.conf.asset, this.conf.money);
        console.log();
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
        this.print_balance();
        this.print_performance();
    }
};

////////////////////
module.exports = TraderBase;
