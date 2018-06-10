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
    this.frame = common.parse_period(conf, 'frame');

    this.short_period  = common.parse_int(conf, 'short_period');
    this.long_period   = common.parse_int(conf, 'long_period');
    this.signal_period = common.parse_int(conf, 'signal_period');

    this.min_up = common.parse_float(conf, 'min_up');
    this.min_down = -Math.abs(common.parse_float(conf, 'min_down'));

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

function comp_to(a, b) {
    return a > b ? green : a < b ? red : white;
}

strat.print_line = (candle, hist, color_date) => {
    this.table.with( 'Date', color_date)
              .with(['Open', 'High', 'Low', 'Close'], comp_to(candle.close, candle.open))
              .with( 'Hist', comp_to(hist, 0))
        .print_line(candle.timestamp,
            candle.open, candle.high, candle.low, candle.close,
            candle.volume,
            hist
        );
};

strat.advise = trades => {
    var ohlcv = ind.ohlcv(trades, this.frame);
    if(!ohlcv.length) return;

    var macd = ind.macd(ohlcv.map(candle => candle.close),
        this.short_period, this.long_period, this.signal_period
    );
    if(!macd.length) return;

    if(!('timestamp' in this)) {
        // print preroll candles with gray date
        this.table.with('*', white).print_head();

        while(macd.length < ohlcv.length)
            macd.unshift({ histogram: '-' });

        ohlcv.forEach((candle, idx) =>
            strat.print_line(candle, macd[idx].histogram, gray)
        );
        this.timestamp = _.last(ohlcv).timestamp;
    }

    move_prev();
    erase_end();

    var candle = _.last(ohlcv);
    var hist   = _.last(macd).histogram;
    var trade  = _.last(trades);

    // print previous candle with blue date
    if(this.timestamp !== candle.timestamp) {
        strat.print_line(_.last(ohlcv, 2)[0], _.last(macd, 2)[0].histogram, blue);
        this.timestamp = candle.timestamp;
    }

    candle.timestamp = trade.timestamp;
    strat.print_line(candle, hist, bg_blue);

    ////////////////////
         if(hist > this.min_up  ) this.trend.state = 'up';
    else if(hist < this.min_down) this.trend.state = 'down';

    var advice = this.trend.advise(trade.timestamp, trade.price);
    if(!_.isUndefined(advice)) advice.print();

    return advice;
}

////////////////////
module.exports = strat;
