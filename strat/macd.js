'use strict';

const advice = root_require('lib/advice');
const common = root_require('lib/common');
const ind    = root_require('lib/ind');
               root_require('lib/show');
const table  = root_require('lib/table');
const trend  = root_require('lib/trend');

const strat = {};

strat.init = conf => {
    this.conf = conf;

    conf.short_period  = common.parse_int(conf, 'short_period', !null);
    conf.long_period   = common.parse_int(conf, 'long_period', !null);
    conf.signal_period = common.parse_int(conf, 'signal_period', !null);

    conf.min_up = common.parse_float(conf, 'min_up', !null);
    conf.min_down = -Math.abs(common.parse_float(conf, 'min_down', !null));

    ////////////////////
    this.trend = new trend();
    this.trend.add_state('up', advice.buy);
    this.trend.add_state('down', advice.sell);

    ////////////////////
    this.table = new table();
    this.table.add_column('Date'  , as_date );
    this.table.add_column('Open'  , as_price);
    this.table.add_column('High'  , as_price);
    this.table.add_column('Low'   , as_price);
    this.table.add_column('Close' , as_price);
    this.table.add_column('Volume', as_vol, yellow);
    this.table.add_column('Hist'  , as_fixed, '+');
};

strat.print_line = (candle, color_date) => {
    this.table.with('Date', color_date)
        .with(['Open', 'High', 'Low', 'Close'], comp_to(candle.close, candle.open))
        .with('Hist', not_in(candle.histogram, this.conf.min_down, this.conf.min_up))
        .print_line(candle);
};

strat.advise = trades => {
    var advice;

    var series = ind.ohlcv(trades, this.conf.frame);
    if(!series.length) return;

    var macd = ind.macd(series.get('close'),
        this.conf.short_period, this.conf.long_period, this.conf.signal_period
    );
    if(!macd.length) return;
    series.merge_end(macd.get(['histogram']));

    var candle = series.end();
    var trade = trades.end();

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

        var done = series.end(-1);

        // print prior candle
        strat.print_line(done, blue);

        // MACD
             if(done.histogram >= this.conf.min_up  ) this.trend.state = 'up';
        else if(done.histogram <= this.conf.min_down) this.trend.state = 'down';

        advice = this.trend.advise(trade.timestamp, this.conf.symbol, trade.price);
    }

    // print current candle
    candle.timestamp = trade.timestamp;
    strat.print_line(candle, bg_blue);

    return advice;
}

////////////////////
module.exports = strat;
