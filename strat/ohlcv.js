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

strat.print_line = (candle, color) => {
    this.table.with('Date', color)
        .with(['Open', 'High', 'Low', 'Close'], as.comp_to(candle.open, candle.close))
        .print_line(candle);
};

strat.advise = trades => {
    if(trades.length > 0
        && trades.end().timestamp !== this.prev_trade) {
    //
        this.prev_trade = trades.end().timestamp;

        var series = ind.ohlcv(trades, this.conf.frame);
        var candle = series.end();

        ansi.move_prev();
        ansi.erase_end();

        // new candle?
        if(candle.timestamp !== this.prev_candle) {

            // first one?
            if(is.undef(this.prev_candle)) {
                this.table.with('*', as.white).print_head();
                series.forEach(candle => strat.print_line(candle, as.gray));
            }
            this.prev_candle = candle.timestamp;

            // reprint prior candle
            if(series.length > 1) strat.print_line(series.end(-1), as.blue);
        }

        // print current candle
        candle.timestamp = trades.end().timestamp;
        strat.print_line(candle, as.bright_blue);
    }

    console.log(as.now());
    ansi.move_prev();
}

////////////////////
module.exports = strat;
