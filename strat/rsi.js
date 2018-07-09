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

strat.print_line = (candle, color) => {
    this.table.with('Date', color)
        .with(['Open', 'High', 'Low', 'Close'], as.comp_to(candle.open, candle.close))
        .with('RSI', as.inot_in(this.conf.oversold,
            this.conf.overbought, candle.rsi, { equal: as.gray }))
        .print_line(candle);
};

strat.advise = trades => {
    var advice;

    if(trades.length > 0
        && trades.end().timestamp !== this.prev_trade) {
    //
        this.prev_trade = trades.end().timestamp;

        var series = ind.ohlcv(trades, this.conf.frame);
        if(series.length >= this.conf.rsi_period) {

            series.merge_end(
                ind.rsi(series.get('close'), this.conf.rsi_period).named('rsi')
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

                    // RSI
                         if(done.rsi <= this.conf.oversold  ) this.trend.state = 'oversold';
                    else if(done.rsi >= this.conf.overbought) this.trend.state = 'overbought';

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
