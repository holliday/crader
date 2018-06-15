'use strict';

const ind = root_require('lib/ind');
root_require('lib/show');
const table = root_require('lib/table');

const strat = {};

strat.init = conf => {
    this.conf = conf;

    ////////////////////
    this.table = new table();
    this.table.add_column('Date'  , as_date );
    this.table.add_column('Open'  , as_price);
    this.table.add_column('High'  , as_price);
    this.table.add_column('Low'   , as_price);
    this.table.add_column('Close' , as_price);
    this.table.add_column('Volume', as_vol, yellow);
};

strat.print_line = (candle, color_date) => {
    this.table.with('Date', color_date)
        .with(['Open', 'High', 'Low', 'Close'], comp_to(candle.close, candle.open))
        .print_line(candle);
};

strat.advise = trades => {
    var advice;

    var series = ind.ohlcv(trades, this.conf.frame);
    if(!series.length) return;

    var candle = series.end();

    // first time?
    if(!is_def(this.timestamp)) {
        this.timestamp = candle.timestamp;

        // print head & preroll candles
        this.table.with('*', white).print_head();
        series.forEach(candle => strat.print_line(candle, gray));
    }

    move_prev();
    erase_end();

    // new candle
    if(this.timestamp !== candle.timestamp) {
        this.timestamp = candle.timestamp;

        // print prior candle
        strat.print_line(series.end(-1), blue);
    }

    // print current candle
    candle.timestamp = trades.end().timestamp;
    strat.print_line(candle, bg_blue);

    return advice;
}

////////////////////
module.exports = strat;
