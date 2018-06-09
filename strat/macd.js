'use strict';

const _ = require('underscore');

const advice = root_require('advice');
const common = root_require('common');
const ind = root_require('indicators');
root_require('show');
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
};

function print_line(candle, macd, color_date) {
    var hist = _.isUndefined(macd) || _.isUndefined(macd.histogram)
             ? '-' : macd.histogram;

    var color = candle.close > candle.open ? green
              : candle.close < candle.open ? red : white;

    console.log(color_date(as_date(candle.timestamp)),
        color (as_price(candle.open)),
        color (as_price(candle.high)),
        color (as_price(candle.low)),
        color (as_price(candle.close)),
        yellow(as_vol  (candle.volume)),
        style(hist, as_fixed, { mod: '+-', comp_to: 0 })
    );
}

function print_preroll(ohlcv, macd) {
    console.log(as_date('Date', '-'),
        as_price('Open'), as_price('High'), as_price('Low'), as_price('Close'),
        as_vol('Volume'), as_fixed('Hist', '-'),
    );

    var diff = macd.length - ohlcv.length;
    ohlcv.forEach((candle, idx) => {
        print_line(candle, macd[idx + diff], gray);
    });
}

strat.advise = trades => {
    var ohlcv = ind.ohlcv(trades, this.frame);
    if(!ohlcv.length) return;

    var macd = ind.macd(
        ohlcv.map(candle => candle.close),
        this.short_period, this.long_period, this.signal_period
    );
    if(!macd.length) return;

    var ohlcv1 = _.last(ohlcv), ohlcv2 = _.last(ohlcv, 2)[0];
    var macd1 = _.last(macd), macd2 = _.last(macd, 2)[0];
    var trade = _.last(trades);

    if(_.isUndefined(this.timestamp)) {
        // print preroll candles with gray date
        print_preroll(ohlcv, macd);

        this.timestamp = ohlcv1.timestamp;
    }

    move_prev();
    erase_end();

    if(this.timestamp !== ohlcv1.timestamp) {
        // print previous candle with blue date
        print_line(ohlcv2, macd2, blue);

        this.timestamp = ohlcv1.timestamp;
    }

    ohlcv1.timestamp = trade.timestamp;
    print_line(ohlcv1, macd1, bg_blue);

    ////////////////////
         if(macd1.histogram > this.min_up  ) this.trend.state = 'up';
    else if(macd1.histogram < this.min_down) this.trend.state = 'down';

    var advice = this.trend.advise(trade.timestamp, trade.price);
    if(!_.isUndefined(advice)) advice.print();

    return advice;
}

////////////////////
module.exports = strat;
