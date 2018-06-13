'use strict';

const ind = root_require('indicators');
root_require('lib/show');
const table = root_require('lib/table');

const strat = {};

strat.init = conf => {
    this.conf = conf;

    this.table = new table();
    this.table.add_column('Date'  , as_date      , blue  );
    this.table.add_column('Volume', as_vol       , yellow);
    this.table.add_column('Price' , as_price, '-', bold  );
};

strat.advise = trades => {
    if(!trades.length) return;

    console.log('Received', bold(trades.length), 'trades:');

    this.table.with('*', white).print_head();
    trades.forEach(trade => this.table.print_line(
        trade.timestamp,
        trade.amount,
        trade.price
    ));
    console.log();
}

module.exports = strat;
