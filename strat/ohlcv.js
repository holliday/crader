'use strict';

const ansi  = lib_require('ansi');
const as    = lib_require('as');
const ind   = lib_require('ind');
const is    = lib_require('is');
const Table = lib_require('table');

const strat = {};

strat.init = conf => {
    this.conf = conf;

    ////////////////////
    this.table = new Table();
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
    var series = ind.ohlcv(trades, this.conf.frame);
    if(!series.length) return;

    var candle = series.end();

    // first time?
    if(is.undef(this.timestamp)) {
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
}

////////////////////
module.exports = strat;
