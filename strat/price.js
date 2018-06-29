'use strict';

const ansi  = lib_require('ansi');
const as    = lib_require('as');
const is    = lib_require('is');
const Table = lib_require('table');

const strat = {};

strat.init = conf => {
    this.conf = conf;

    this.table = new Table();
    this.table.add_column('Date'  , as.date, as.blue);
    this.table.add_column('Price' , as.price);
    this.table.add_column('Amount', as.vol, as.yellow);

    this.prev_trade = {};
};

strat.advise = trades => {
    if(trades.length > 0
        && trades.end().timestamp !== this.prev_trade.timestamp) {
    //
        var end_trade = trades.end();

        if(is.undef(this.prev_trade.timestamp))
            this.table.with('*', as.white).print_head();
        else ansi.move_prev();

        this.table.with('Price',
            as.comp_to(this.prev_trade.price, end_trade.price)
        ).print_line(end_trade);

        this.prev_trade = end_trade;
    }

    console.log(as.now());
    ansi.move_prev();
}

module.exports = strat;
