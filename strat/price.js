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

    this.trade = {};
};

strat.advise = trades => {
    if(trades.length === 0) return;

    if(is.undef(this.trade.timestamp))
        this.table.with('*', as.white).print_head();

    var trade = trades.end();
    if(trade.timestamp !== this.trade.timestamp) {
        ansi.erase_end();

        this.table.with('Price',
            as.comp_to(trade.price, this.trade.price)
        ).print_line(trade);

        ansi.move_prev();
        this.trade = trade;
    }
}

module.exports = strat;
