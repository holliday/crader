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

    conf.min_up = parse.float(conf, 'min_up', !null);
    conf.min_down = -Math.abs(parse.float(conf, 'min_down', !null));

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

strat.print_line = (candle, color_date) => {
    this.table.with('Date', color_date)
        .with(['Open', 'High', 'Low', 'Close'], as.comp_to(candle.close, candle.open))
        .with('K-D', as.comp_to(candle.kd, 0))
        .print_line(candle);
};

strat.advise = trades => {
    var advice;

    var series = ind.ohlcv(trades, this.conf.frame);
    if(series.length <=
        this.conf.rsi_period + this.conf.stoch_period + this.conf.stoch_k
    ) return;

    var rsi = ind.rsi(series.get('close'), this.conf.rsi_period);

    series.merge_end(
        ind.stoch(rsi, rsi, rsi,
            this.conf.stoch_period, this.conf.stoch_k, this.conf.stoch_d
        ).map(e => ({ k: e.k, d: e.d, kd: e.k - e.d }))
    );

    var candle = series.end();
    var trade = trades.end();

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

        var done = series.end(-1);

        // print prior candle
        strat.print_line(done, as.blue);

        // Stoch-RSI
             if(done.kd >= this.conf.min_up  ) this.trend.state = 'up';
        else if(done.kd <= this.conf.min_down) this.trend.state = 'down';

        advice = this.trend.advise();
    }

    // print current candle
    candle.timestamp = trade.timestamp;
    strat.print_line(candle, as.bg_blue);

    return advice;
}

////////////////////
module.exports = strat;
