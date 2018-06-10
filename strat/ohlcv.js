'use strict';

const advice = root_require('advice');
const common = root_require('common');
const ind = root_require('indicators');
root_require('show');
const table = root_require('table');

const strat = {};

strat.init = conf => {
    this.frame = common.parse_period(conf, 'frame');

    this.table = new table();
    this.table.add_column('Date'  , as_date , blue  );
    this.table.add_column('Open'  , as_price        );
    this.table.add_column('High'  , as_price, green );
    this.table.add_column('Low'   , as_price, red   );
    this.table.add_column('Close' , as_price, bold  );
    this.table.add_column('Volume', as_vol  , yellow);
};

strat.advise = trades => {
    var ohlcv = ind.ohlcv(trades, this.frame);
    if(!ohlcv.length) return;

    console.log('Received', bold(ohlcv.length), 'OHLCV candles:');

    this.table.with('*', gray).print_head();
    ohlcv.forEach(candle =>
        this.table.print_line(candle.timestamp,
            candle.open, candle.high, candle.low, candle.close,
            candle.volume,
        )
    );
    console.log();
}

module.exports = strat;
