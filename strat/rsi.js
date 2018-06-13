'use strict';

const _ = require('underscore');

const advice = root_require('lib/advice');
const common = root_require('common');
const ind = root_require('indicators');
root_require('show');
const table = root_require('table');
const trend = root_require('lib/trend');

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
    this.table.add_column('Date'  , as_date );
    this.table.add_column('Open'  , as_price);
    this.table.add_column('High'  , as_price);
    this.table.add_column('Low'   , as_price);
    this.table.add_column('Close' , as_price);
    this.table.add_column('Volume', as_vol, yellow);
    this.table.add_column('RSI'   , as_num  );
};

strat.print_line = (candle, rsi, color_date) => {
    this.table.with('Date', color_date)
        .with(['Open', 'High', 'Low', 'Close'], comp_to(candle.close, candle.open))
        .with('RSI', not_in(rsi, this.conf.oversold, this.conf.overbought, 
            { below: green, above: red }))
        .print_line(candle.timestamp,
            candle.open, candle.high, candle.low, candle.close,
            candle.volume,
            rsi
        );
};

strat.advise = trades => {
    var advice;

    var ohlcv = ind.ohlcv(trades, this.conf.frame);
    if(!ohlcv.length) return;

    var rsi = ind.rsi(ohlcv.map(candle => candle.close), this.conf.rsi_period);
    if(!rsi.length) return;

    var trade = _.last(trades);
    var [ candle_done, candle_new ] = _.last(ohlcv, 2);
    var [ rsi_done, rsi_new ] = _.last(rsi, 2);

    // first time?
    if(_.isUndefined(this.timestamp)) {
        this.timestamp = candle_new.timestamp;

        // print head & preroll
        this.table.with('*', white).print_head();

        while(rsi.length < ohlcv.length) rsi.unshift('-');
        ohlcv.forEach((candle, idx) =>
            strat.print_line(candle, rsi[idx], gray)
        );
    }

    move_prev();
    erase_end();

    // new candle
    if(this.timestamp !== candle_new.timestamp) {
        this.timestamp = candle_new.timestamp;

        // print final line
        strat.print_line(candle_done, rsi_done, blue);

        // RSI
             if(rsi_done <= this.conf.oversold) this.trend.state = 'oversold';
        else if(rsi_done >= this.conf.overbought) this.trend.state = 'overbought';

        advice = this.trend.advise(trade.timestamp, this.conf.symbol, trade.price);
    }

    // print current line
    candle_new.timestamp = trade.timestamp;
    strat.print_line(candle_new, rsi_new, bg_blue);

    return advice;
}

////////////////////
module.exports = strat;
