'use strict';

const EventEmitter = require('events');
const as           = lib_require('as');
const is           = lib_require('is');
const trade        = lib_require('trade');

////////////////////
class TraderBase extends EventEmitter {
    constructor(conf) {
        super();
        this.conf = conf;

        if(conf.start_asset < 0.0001 && conf.start_money < 0.01)
            console.log(as.bg_yellow('You are broke!'));
        this.print_start_balance();

        this.trades = [];
    }

    ////////////////////
    accept(advice) {
        // do nothing
    }

    ////////////////////
    _print_balance(type, asset, money) {
        console.log(
            type, 'balance:',
            this.conf.symbol.as_asset(), as.vol(asset).trim(),
            this.conf.symbol.as_money(), as.price(money).trim()
        );
    }

    print_start_balance() {
        this._print_balance('Starting',
            this.conf.start_asset, this.conf.start_money
        );
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
        var conf = this.conf;

        var start_value = conf.start_asset * conf.start_trade.price + conf.start_money;
        var value = conf.asset * conf.end_trade.price + conf.money;
        var hold_value = conf.start_asset * conf.end_trade.price + conf.start_money;

        var perf = 100 * (value / start_value - 1);
        var perf_hold = 100 * (value / hold_value - 1);

        console.log(
            as.bold('Performance:'),
            is.def(perf)
                ? as.comp_to(perf, 0)(as.num(perf, '+').trim()+'%')
                : '',
            as.gray('compared to hold:'),
            is.def(perf_hold)
                ? as.comp_to(perf_hold, 0)(as.num(perf_hold, '+').trim()+'%')
                : '',
        );
    }

    ////////////////////
    print_summary() {
        if(this.trades.length === 0) return;

        console.log(
`

----=[ Summary ]=---------------------------------------------------------------
`
        );
        this.print_start_balance();
        this.print_trades();
        this.print_balance('Ending');
        this.print_performance();
        console.log(
`
--------------------------------------------------------------------------------
`
        );
    }
};

////////////////////
module.exports = TraderBase;
