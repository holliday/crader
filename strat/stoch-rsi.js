'use strict';

const Advice = lib_require('advice');
const ansi   = lib_require('ansi');
const as     = lib_require('as');
const ind    = lib_require('ind');
const is     = lib_require('is');
const parse  = lib_require('parse');
const Table  = lib_require('table');
const Trend  = lib_require('trend');

const strat = {};

strat.init = conf => {
    this.conf = conf;

    conf.rsi_period   = parse.int(conf, 'rsi_period', !null);
    conf.stoch_period = parse.int(conf, 'stoch_period', !null);
    conf.stoch_k      = parse.int(conf, 'stoch_k', !null);
    conf.stoch_d      = parse.int(conf, 'stoch_d', !null);

    conf.min_up = parse.float(conf, 'min_up');
    if(is.undef(conf.min_up)) conf.min_up = 0;

    conf.min_down = parse.float(conf, 'min_down');
    if(is.undef(conf.min_down)) conf.min_down = 0;
    else conf.min_down = -Math.abs(conf.min_down);

    ////////////////////
    this.trend = new Trend();
    this.trend.add_state('up', Advice.buy);
    this.trend.add_state('down', Advice.sell);

    ////////////////////
    this.table = new Table();
    this.table.add_column('Date'  , as.date );
    this.table.add_column('Open'  , as.price);
    this.table.add_column('High'  , as.price);
    this.table.add_column('Low'   , as.price);
    this.table.add_column('Close' , as.price);
    this.table.add_column('Volume', as.vol, as.yellow);
    this.table.add_column('K'     , as.fixed, as.cyan);
    this.table.add_column('D'     , as.fixed, as.magenta);
    this.table.add_column('K-D'   , as.fixed, '+');
};

strat.print_line = (candle, color) => {
    this.table.with('Date', color)
        .with(['Open', 'High', 'Low', 'Close'], as.comp_to(candle.open, candle.close))
        .with('K-D', as.comp_to_0(candle.kd, { equal: as.gray }))
        .print_line(candle);
};

strat.advise = trades => {
    var advice;

    if(trades.length > 0
        && trades.end().timestamp !== this.prev_trade) {
    //
        this.prev_trade = trades.end().timestamp;

        var series = ind.ohlcv(trades, this.conf.frame);
        if(series.length >= this.conf.rsi_period
            + this.conf.stoch_period + this.conf.stoch_k) {
        //
            var rsi = ind.rsi(series.get('close'), this.conf.rsi_period);

            series.merge_end(
                ind.stoch(rsi, rsi, rsi,
                    this.conf.stoch_period, this.conf.stoch_k, this.conf.stoch_d
                ).map(e => ({ k: e.k, d: e.d, kd: e.k - e.d }))
            );
            var candle = series.end();

            // first candle?
            if(is.undef(this.prev_candle)) {
                this.prev_candle = candle.timestamp;

                this.table.with('*', as.white).print_head();
                series.forEach(candle => strat.print_line(candle, as.gray));
            }
            ansi.move_prev();

            // new candle?
            if(candle.timestamp !== this.prev_candle) {
                this.prev_candle = candle.timestamp;

                if(series.length > 1) {
                    var done = series.end(-1);

                    // reprint prior candle
                    strat.print_line(done, as.blue);

                    // Stoch-RSI
                         if(done.kd >= this.conf.min_up  ) this.trend.state = 'up';
                    else if(done.kd <= this.conf.min_down) this.trend.state = 'down';

                    advice = this.trend.advise();
                }
            }

            // print current candle
            candle.timestamp = trades.end().timestamp;
            strat.print_line(candle, as.bright_blue);
        }
    }

    console.log(as.now());
    ansi.move_prev();

    return advice;
}

////////////////////
module.exports = strat;
