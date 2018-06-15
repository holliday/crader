'use strict';

const ansi  = root_require('lib/ansi');
const as    = root_require('lib/as');
const ind   = root_require('lib/ind');
const table = root_require('lib/table');

const strat = {};

strat.init = conf => {
    this.conf = conf;

    ////////////////////
    this.table = new table();
    this.table.add_column('Date'  , as.date );
    this.table.add_column('Open'  , as.price);
    this.table.add_column('High'  , as.price);
    this.table.add_column('Low'   , as.price);
    this.table.add_column('Close' , as.price);
    this.table.add_column('Volume', as.vol, as.yellow);
};

strat.print_line = (candle, color_date) => {
    this.table.with('Date', color_date)
        .with(['Open', 'High', 'Low', 'Close'], as.comp_to(candle.close, candle.open))
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
        this.table.with('*', as.white).print_head();
        series.forEach(candle => strat.print_line(candle, as.gray));
    }

    ansi.move_prev();
    ansi.erase_end();

    // new candle
    if(this.timestamp !== candle.timestamp) {
        this.timestamp = candle.timestamp;

        // print prior candle
        strat.print_line(series.end(-1), as.blue);
    }

    // print current candle
    candle.timestamp = trades.end().timestamp;
    strat.print_line(candle, as.bg_blue);

    return advice;
}

////////////////////
module.exports = strat;
