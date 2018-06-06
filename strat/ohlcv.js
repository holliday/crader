'use strict';

const advice = root_require('advice');
const common = root_require('common');
const ind = root_require('indicators');
root_require('show');

const strat = {};

strat.init = conf => {
    this.frame = common.period(conf.frame);
};

strat.advise = trades => {
    var ohlcv = ind.ohlcv(trades, this.frame);

    console.log('Received', bold(ohlcv.length), 'OHLCV candles:');

    console.log(gray('Date                Open    High    Low     Close   Volume'));
    ohlcv.forEach(candle => {
        console.log(blue(date(candle.timestamp)),
                  fmt('%-7.6g', candle.open),
            green(fmt('%-7.6g', candle.high)),
              red(fmt('%-7.6g', candle.low)),
             bold(fmt('%-7.6g', candle.close)),
             cyan(fmt('%-9.8g', candle.volume)),
        );
    });

    //return advice.buy();
    // or
    //return advice.sell();
}

module.exports = strat;
