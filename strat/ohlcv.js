'use strict';

const advice = root_require('advice');
const common = root_require('common');
const ind = root_require('indicators');
root_require('show');

const strat = {};

strat.init = conf => {
    this.frame = common.parse_period(conf, 'frame');
};

strat.advise = trades => {
    var ohlcv = ind.ohlcv(trades, this.frame);

    console.log('Received', bold(ohlcv.length), 'OHLCV candles:');

    console.log(gray(as_date('Date'),
        as_price('Open'), as_price('High'), as_price('Low'), as_price('Close'),
        as_vol('Volume'),
    ));
    ohlcv.forEach(candle => {
        console.log(blue(as_date(candle.timestamp)),
            white (as_price(candle.open)),
            green (as_price(candle.high)),
            red   (as_price(candle.low)),
            bold  (as_price(candle.close)),
            yellow(as_vol  (candle.volume)),
        );
    });

    //return advice.buy();
    // or
    //return advice.sell();
}

module.exports = strat;
