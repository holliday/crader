'use strict';

const advice = root_require('advice');
const common = root_require('common');
const ind = root_require('indicators');
root_require('show');

const strat = {};

strat.init = conf => {
    this.frame = common.period(conf.frame);
};

function col(amount) { return fmt('%-9.8g', amount); }

strat.advise = trades => {
    var ohlcv = ind.ohlcv(trades, this.frame);

    console.log('Received', bold(ohlcv.length), 'OHLCV candles:');

    console.log(gray('Date                    Open      High      Low       Close     Volume'));
    ohlcv.forEach(candle => {
        console.log(blue(date(candle.timestamp)),
                  col(candle.open),
            green(col(candle.high)),
              red(col(candle.low)),
             bold(col(candle.close)),
             cyan(col(candle.volume)),
        );
    });

    //return advice.buy();
    // or
    //return advice.sell();
}

module.exports = strat;
