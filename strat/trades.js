'use strict';

const as    = lib_require('as');
const is    = lib_require('is');
const table = lib_require('table');

const strat = {};

strat.init = conf => {
    this.conf = conf;

    this.table = new table();
    this.table.add_column('Date'  , as.date, as.blue);
    this.table.add_column('Price' , as.price);
    this.table.add_column('Amount', as.vol, as.yellow);
};

strat.advise = trades => {
    if(trades.length === 0) return;

    if(is.undef(this.trade)) {
        this.trade = { timestamp: 0 };
        this.table.with('*', as.white).print_head();
    }

    trades.forEach(trade => {
        if(trade.timestamp <= this.trade.timestamp) return;

        this.table.with('Price',
            as.comp_to(trade.price, this.trade.price)
        ).print_line(trade);

        this.trade = trade;
    });
}

module.exports = strat;
