'use strict';

const as    = lib_require('as');
const table = lib_require('table');

const strat = {};

strat.init = conf => {
    this.conf = conf;

    this.table = new table();
    this.table.add_column('Date'  , as.date      , as.blue  );
    this.table.add_column('Volume', as.vol       , as.yellow);
    this.table.add_column('Price' , as.price, '-', as.bold  );
};

strat.advise = trades => {
    console.log('Received', as.bold(trades.length), 'trades:');

    this.table.with('*', as.white).print_head();
    trades.forEach(trade => this.table.print_line(
        trade.timestamp,
        trade.amount,
        trade.price
    ));
    console.log();
}

module.exports = strat;
