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

    conf.rsi_period = parse.int(conf, 'rsi_period', !null);
    conf.oversold   = parse.int(conf, 'oversold', !null);
    conf.overbought = parse.int(conf, 'overbought', !null);

    ////////////////////
    this.trend = new Trend();
    this.trend.add_state('oversold', Advice.buy);
    this.trend.add_state('overbought', Advice.sell);

    ////////////////////
    this.table = new Table();
    this.table.add_column('Date'  , as.date );
    this.table.add_column('Open'  , as.price);
    this.table.add_column('High'  , as.price);
    this.table.add_column('Low'   , as.price);
    this.table.add_column('Close' , as.price);
    this.table.add_column('Volume', as.vol, as.yellow);
    this.table.add_column('RSI'   , as.num  );
};

strat.print_line = (candle, color_date) => {
    this.table.with('Date', color_date)
        .with(['Open', 'High', 'Low', 'Close'], as.comp_to(candle.open, candle.close))
        .with('RSI', as.inot_in(this.conf.oversold, this.conf.overbought, candle.rsi))
        .print_line(candle);
};

strat.advise = trades => {
    var advice;

    var series = ind.ohlcv(trades, this.conf.frame);
    if(series.length <= this.conf.rsi_period) return;

    series.merge_end(
        ind.rsi(series.get('close'), this.conf.rsi_period).named('rsi')
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

        // RSI
             if(done.rsi <= this.conf.oversold  ) this.trend.state = 'oversold';
        else if(done.rsi >= this.conf.overbought) this.trend.state = 'overbought';

        advice = this.trend.advise();
    }

    // print current candle
    candle.timestamp = trade.timestamp;
    strat.print_line(candle, as.bg_blue);

    return advice;
}

////////////////////
module.exports = strat;
