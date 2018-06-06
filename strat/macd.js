'use strict';

const _ = require('underscore');

const advice = root_require('advice');
const common = root_require('common');
const ind = root_require('indicators');
const show = root_require('show');

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

function print_line(candle, macd1, date_color) {
    var color = comp_to(candle.close, candle.open);

    console.log(date_color(as_date(candle.timestamp)),
        color(fmt('%-7.6g', candle.open)),
        color(fmt('%-7.6g', candle.high)),
        color(fmt('%-7.6g', candle.low)),
        color(fmt('%-7.6g', candle.close)),
         cyan(fmt('%-9.8g', candle.volume)),
        !_.isUndefined(macd1)
            ? comp_to(macd1.histogram, 0)(fmt('%+-9.4g', macd1.histogram))
            : fmt('%-7s', '-')
    );
}

function print_preroll(ohlcv, macd) {
    console.log(fmt('%-23s', 'Date'),
        fmt('%-7s', 'Open'),
        fmt('%-7s', 'High'),
        fmt('%-7s', 'Low'),
        fmt('%-7s', 'Close'),
        fmt('%-9s', 'Volume'),
        fmt('%-7s', 'Hist'),
    );

    var diff = macd.length - ohlcv.length;
    ohlcv.forEach((candle, index) => {
        print_line(candle, macd[index + diff], gray);
    });
}

strat.advise = trades => {
    var ohlcv = ind.ohlcv(trades, this.frame);

    var macd = ind.macd(
        ohlcv.map(candle => candle.close),
        this.short_period, this.long_period, this.signal_period
    );

    var ohlcv1 = _.last(ohlcv), ohlcv2 = _.last(ohlcv, 2)[0];
    var macd1  = _.last(macd), macd2 = _.last(macd, 2)[0];
    var trade  = _.last(trades);

    if(_.isUndefined(this.timestamp)) {
        // print preroll candles with gray date
        print_preroll(ohlcv, macd);

        this.timestamp = ohlcv1.timestamp;
        this.trend = Math.sign(macd1.histogram);
    }

    show.move_prev();
    show.erase_end();

    if(this.timestamp !== ohlcv1.timestamp) {
        // print previous candle with white date
        print_line(ohlcv2, macd2, white);

        this.timestamp = ohlcv1.timestamp;
    }

    ohlcv1.timestamp = trade.timestamp;
    print_line(ohlcv1, macd1, bg_blue);

    ////////////////////
    var hist = macd1.histogram;
    var adv;

    // trend reversal
    if(this.trend !== Math.sign(hist)) {
        if(hist > this.min_up) {
            this.trend = Math.sign(hist);

            adv = advice.buy(trade.timestamp, trade.price);
            adv.print();

        } else if(hist < this.min_down) {
            this.trend = Math.sign(hist);

            adv = advice.sell(trade.timestamp, trade.price);
            adv.print();
        }
    }

    return adv;
}

module.exports = strat;
