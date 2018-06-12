'use strict';

const _ = require('underscore');

const advice = root_require('advice');
const common = root_require('common');
const ind = root_require('indicators');
root_require('show');
const table = root_require('table');
const trend = root_require('trend');

const strat = {};

strat.init = conf => {
    this.conf = conf;

    conf.short_period  = common.parse_int(conf, 'short_period', !null);
    conf.long_period   = common.parse_int(conf, 'long_period', !null);
    conf.signal_period = common.parse_int(conf, 'signal_period', !null);

    conf.min_up = common.parse_float(conf, 'min_up', !null);
    conf.min_down = -Math.abs(common.parse_float(conf, 'min_down', !null));

    ////////////////////
    this.trend = new trend;
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
    this.table.add_column('Hist'  , as_fixed, '+-');
};

strat.print_line = (candle, hist, color_date) => {
    this.table.with( 'Date', color_date)
        .with(['Open', 'High', 'Low', 'Close'], comp_to(candle.close, candle.open))
        .with('Hist', not_in(hist, this.conf.min_down, this.conf.min_up))
        .print_line(candle.timestamp,
            candle.open, candle.high, candle.low, candle.close,
            candle.volume,
            hist
        );
};

strat.advise = trades => {
    var advice;

    var ohlcv = ind.ohlcv(trades, this.conf.frame);
    if(!ohlcv.length) return;

    var macd = ind.macd(ohlcv.map(candle => candle.close),
        this.conf.short_period, this.conf.long_period, this.conf.signal_period
    );
    if(!macd.length) return;

    var trade = _.last(trades);
    var [ candle_done, candle_new ] = _.last(ohlcv, 2);
    var [ macd_done, macd_new ] = _.last(macd, 2);

    // first time?
    if(_.isUndefined(this.timestamp)) {
        this.timestamp = candle_new.timestamp;

        // print head & preroll
        this.table.with('*', white).print_head();

        while(macd.length < ohlcv.length) macd.unshift({ histogram: '-' });
        ohlcv.forEach((candle, idx) =>
            strat.print_line(candle, macd[idx].histogram, gray)
        );
    }

    move_prev();
    erase_end();

    // new candle
    if(this.timestamp !== candle_new.timestamp) {
        this.timestamp = candle_new.timestamp;

        // print final line
        strat.print_line(candle_done, macd_done.histogram, blue);

        // MACD
             if(macd_done.histogram >= this.conf.min_up  ) this.trend.state = 'up';
        else if(macd_done.histogram <= this.conf.min_down) this.trend.state = 'down';

        advice = this.trend.advise(trade.timestamp, trade.price);
    }

    // print current line
    candle_new.timestamp = trade.timestamp;
    strat.print_line(candle_new, macd_new.histogram, bg_blue);

    return advice;
}

////////////////////
module.exports = strat;
