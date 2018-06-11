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

    this.rsi_period = common.parse_int(conf, 'rsi_period');
    this.oversold   = common.parse_int(conf, 'oversold');
    this.overbought = common.parse_int(conf, 'overbought');

    this.stoch_period = common.parse_int(conf, 'stoch_period');
    this.stoch_k = common.parse_int(conf, 'stoch_k');
    this.stoch_d = common.parse_int(conf, 'stoch_d');

    this.min_up = common.parse_float(conf, 'min_up');
    this.min_down = -Math.abs(common.parse_float(conf, 'min_down'));

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
    this.table.add_column('RSI'   , as_num);
    this.table.add_column('K'     , as_fixed, cyan);
    this.table.add_column('D'     , as_fixed, magenta);
    this.table.add_column('K-D'   , as_fixed, '+-');
};

strat.print_line = (candle, rsi, stoch, color_date) => {
    this.table.with('Date', color_date)
        .with(['Open', 'High', 'Low', 'Close'], comp_to(candle.close, candle.open))
        .with('RSI', not_in(rsi, this.oversold, this.overbought, 
            { below: green, above: red }))
        .with('K-D', comp_to(stoch.kd, 0))
        .print_line(candle.timestamp,
            candle.open, candle.high, candle.low, candle.close,
            candle.volume,
            rsi,
            stoch.k, stoch.d, stoch.kd
        );
};

strat.advise = trades => {
    var advice;

    var ohlcv = ind.ohlcv(trades, this.frame);
    if(!ohlcv.length) return;

    var rsi = ind.rsi(ohlcv.map(candle => candle.close), this.rsi_period);
    if(!rsi.length) return;

    var stoch = ind.stoch(rsi, rsi, rsi,
        this.stoch_period, this.stoch_k, this.stoch_d
    );
    if(!stoch.length) return;
    stoch = stoch.map(e => ({ k: e.k, d: e.d, kd: e.k - e.d })); // add K-D

    var trade = _.last(trades);
    var [ candle_done, candle_new ] = _.last(ohlcv, 2);
    var [ rsi_done, rsi_new ] = _.last(rsi, 2);
    var [ stoch_done, stoch_new ] = _.last(stoch, 2);

    // first time?
    if(!('timestamp' in this)) {
        this.timestamp = candle_new.timestamp;

        // print head & preroll
        this.table.with('*', white).print_head();

        while(stoch.length < ohlcv.length) stoch.unshift({
            k: '-', d: '-', kd: '-'
        });
        while(rsi.length < ohlcv.length) rsi.unshift('-');
        ohlcv.forEach((candle, idx) =>
            strat.print_line(candle, rsi[idx], stoch[idx], gray)
        );
    }

    move_prev();
    erase_end();

    // new candle
    if(this.timestamp !== candle_new.timestamp) {
        this.timestamp = candle_new.timestamp;

        // print final line
        strat.print_line(candle_done, rsi_done, stoch_done, blue);

        // Stoch-RSI
             if(stoch_done.kd >= this.min_up) this.trend.state = 'up';
        else if(stoch_done.kd <= this.min_down) this.trend.state = 'down';

        advice = this.trend.advise(trade.timestamp, trade.price);
        if(!_.isUndefined(advice)) advice.print();
    }

    // print current line
    candle_new.timestamp = trade.timestamp;
    strat.print_line(candle_new, rsi_new, stoch_new, bg_blue);

    return advice;
}

////////////////////
module.exports = strat;
