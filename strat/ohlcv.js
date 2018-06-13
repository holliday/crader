'use strict';

const common = root_require('common');
const ind = root_require('lib/ind'); // indicators
root_require('lib/show');
const table = root_require('lib/table');

const strat = {};

strat.init = conf => {
    this.conf = conf;

    this.table = new table();
    this.table.add_column('Date'  , as_date , blue  );
    this.table.add_column('Open'  , as_price        );
    this.table.add_column('High'  , as_price, green );
    this.table.add_column('Low'   , as_price, red   );
    this.table.add_column('Close' , as_price, bold  );
    this.table.add_column('Volume', as_vol  , yellow);
};

strat.advise = trades => {
    var ohlcv = ind.ohlcv(trades, this.conf.frame);
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
