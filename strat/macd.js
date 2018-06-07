'use strict';

const _ = require('underscore');

const advice = root_require('advice');
const common = root_require('common');
const ind = root_require('indicators');
root_require('show');

const strat = {};

strat.init = conf => {
    this.frame = common.parse_period(conf.frame, 'frame');

    this.short_period  = common.parse_int(conf.short_period, 'long_period');
    this.long_period   = common.parse_int(conf.long_period, 'long_period');
    this.signal_period = common.parse_int(conf.signal_period, 'signal_period');

    this.min_up = common.parse_float(conf.min_up, 'min_up');
    this.min_down = -Math.abs(common.parse_float(conf.min_down, 'min_down'));
};

function comp_to(value, other) {
    return value > other ? green : (value < other ? red : white);
}

function print_line(candle, macd, color_date) {
    var hist = _.isUndefined(macd) || _.isUndefined(macd.histogram)
             ? '-' : macd.histogram;
    var color = comp_to(candle.close, candle.open);

    console.log(color_date(as_date(candle.timestamp)),
        color (as_price(candle.open)),
        color (as_price(candle.high)),
        color (as_price(candle.low)),
        color (as_price(candle.close)),
        yellow(as_vol  (candle.volume)),
        comp_to(hist, 0)(as_fixed(hist, '+-'))
    );
}

function print_preroll(ohlcv, macd) {
    console.log(as_date('Date'),
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

    var macd = ind.macd(
        ohlcv.map(candle => candle.close),
        this.short_period, this.long_period, this.signal_period
    );

    var ohlcv1 = _.last(ohlcv), ohlcv2 = _.last(ohlcv, 2)[0];
    var macd1 = _.last(macd), macd2 = _.last(macd, 2)[0];
    var trade = _.last(trades);

    if(_.isUndefined(this.timestamp)) {
        // print preroll candles with gray date
        print_preroll(ohlcv, macd);

        this.timestamp = ohlcv1.timestamp;
        this.trend = Math.sign(macd1.histogram);
    }

    move_prev();
    erase_end();

    if(this.timestamp !== ohlcv1.timestamp) {
        // print previous candle with white date
        print_line(ohlcv2, macd2, white);

        this.timestamp = ohlcv1.timestamp;
    }

    ohlcv1.timestamp = trade.timestamp;
    print_line(ohlcv1, macd1, bg_blue);

    ////////////////////
    var adv;

    // trend reversal
    if(this.trend !== Math.sign(macd1.histogram)) {
        if(macd1.histogram > this.min_up) {
            this.trend = Math.sign(macd1.histogram);

            adv = advice.buy(trade.timestamp, trade.price);
            adv.print();

        } else if(macd1.histogram < this.min_down) {
            this.trend = Math.sign(macd1.histogram);

            adv = advice.sell(trade.timestamp, trade.price);
            adv.print();
        }
    }

    return adv;
}

////////////////////
module.exports = strat;
