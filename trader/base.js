'use strict';

const EventEmitter = require('events');
const as           = lib_require('as');
const is           = lib_require('is');
const Series       = lib_require('series');
const Table        = lib_require('table');
const Trade        = lib_require('trade');

////////////////////
class TraderBase extends EventEmitter {
    constructor(conf) {
        super();
        this.conf = conf;

        this.table = new Table();
        this.table.add_column('Date', as.date, as.blue);
        this.table.add_column(this.conf.symbol.asset, as.vol, '+', as.cyan);
        this.table.add_column('Price', as.price);
        this.table.add_column(this.conf.symbol.money, as.price, '+', as.magenta);
        this.table.add_column('Gain', as.price, '+');

        this.trades = new Series();
    }

    static async create(conf) {
        return new TraderBase(conf);
    }

    ////////////////////
    accept(advice) {
        // do nothing
    }

    ////////////////////
    // balance functions
    _print_balance(name, asset, money) {
        console.log(name,
            as.asset(this.conf.symbol), as.vol(asset).trim(),
            as.money(this.conf.symbol), as.price(money).trim()
        );
    }

    print_start_balance() {
        this._print_balance('Starting balance:',
            this.conf.start_asset, this.conf.start_money
        );
    }

    print_balance(name = 'current') {
        this._print_balance(
            name.replace(/^\w/, c => c.toUpperCase()) + ' balance:',
            this.conf.asset, this.conf.money
        );
    }

    ////////////////////
    // trade functions
    _print_trade(trade, buy_trade) {
        var gain = '';
        if(trade.is_sell() && is.def(buy_trade))
            gain = trade.amount * (trade.price - buy_trade.price);

        var fac = trade.is_buy() ? 1 : -1;
        this.table
            .with(this.conf.symbol.asset, as.comp_to_0(fac))
            .with(this.conf.symbol.money, as.comp_to_0(-fac))
            .with('Gain', as.not_in(-0.0001, 0.0001, gain, { equal: as.gray }))
            .print_line(
                trade.timestamp,
                +fac * trade.amount,
                trade.price,
                -fac * trade.amount * trade.price,
                gain,
            );
    }

    add_trade(trade) {
        this.trades.push(trade);

        console.log(as.gray('Executed trade:'));
        this.table.print_head();
        this._print_trade(trade, this.buy_trade);
        this.print_balance();
        console.log();

        if(trade.is_buy()) this.buy_trade = trade;
    }

    print_trades() {
        console.log(as.gray('Executed trades:'));

        this.table.print_head();
        var buy_trade;
        this.trades.forEach(trade => {
            this._print_trade(trade, buy_trade)
            if(trade.is_buy()) buy_trade = trade;
        });
    }

    ////////////////////
    // performance functions
    get start_value() {
        return this.conf.start_asset * this.conf.start_trade.price + this.conf.start_money;
    }

    get value() {
        return this.conf.asset * this.conf.end_trade.price + this.conf.money;
    }

    get hold_value() {
        return this.conf.start_asset * this.conf.end_trade.price + this.conf.start_money;
    }

    print_performance() {
        var perf = this.value - this.start_value;
        var perf_pct = perf / this.start_value;
        var style = as.comp_to_0(perf);

        var hold_perf = this.value - this.hold_value;
        var hold_perf_pct = hold_perf / this.hold_value;
        var hold_style = as.comp_to_0(hold_perf);

        console.log(as.bold('Performance:'),
            as.money(this.conf.symbol),
            style(
                as.price(perf, '+').trim(),
                as.pct(perf_pct).trim()
            ),
            as.gray('compared to hold:'),
            as.money(this.conf.symbol),
            hold_style(
                as.price(hold_perf, '+').trim(),
                as.pct(hold_perf_pct).trim()
            ),
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
        console.log();
        this.print_balance('ending');
        console.log();
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
