'use strict';

const advice = root_require('lib/advice');
const ansi   = root_require('lib/ansi');
const as     = root_require('lib/as');
const common = root_require('lib/common');
const ind    = root_require('lib/ind');
const table  = root_require('lib/table');
const trend  = root_require('lib/trend');

const strat = {};

strat.init = conf => {
    this.conf = conf;

    conf.rsi_period = common.parse_int(conf, 'rsi_period', !null);
    conf.oversold   = common.parse_int(conf, 'oversold', !null);
    conf.overbought = common.parse_int(conf, 'overbought', !null);

    ////////////////////
    this.trend = new trend();
    this.trend.add_state('oversold', advice.buy);
    this.trend.add_state('overbought', advice.sell);

    ////////////////////
    this.table = new table();
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
        .with(['Open', 'High', 'Low', 'Close'], as.comp_to(candle.close, candle.open))
        .with('RSI', as.not_in(candle.rsi, this.conf.oversold, this.conf.overbought, 
            { below: as.green, above: as.red }))
        .print_line(candle);
};

strat.advise = trades => {
    var advice;

    var series = ind.ohlcv(trades, this.conf.frame);
    if(!series.length) return;

    var rsi = ind.rsi(series.get('close'), this.conf.rsi_period);
    if(!rsi.length) return;
    rsi.name = 'rsi';
    series.merge_end(rsi);

    var candle = series.end();
    var trade = trades.end();

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

        var done = series.end(-1);

        // print prior candle
        strat.print_line(done, as.blue);

        // RSI
             if(done.rsi <= this.conf.oversold  ) this.trend.state = 'oversold';
        else if(done.rsi >= this.conf.overbought) this.trend.state = 'overbought';

        advice = this.trend.advise(trade.timestamp, this.conf.symbol, trade.price);
    }

    // print current candle
    candle.timestamp = trade.timestamp;
    strat.print_line(candle, as.bg_blue);

    return advice;
}

////////////////////
module.exports = strat;
