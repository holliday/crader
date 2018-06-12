var conf = {};

// strat name
conf.strat = 'ohlcv';

// strat data
//
// For candlestick strats, 'count' should be set to the
// number of candles and 'frame' should be set to candle size.
//
// Otherwise, 'count' should be set to 1 and 'frame' should be
// set to the length of time for past trades needed by the strat.
//
conf.frame = '15m';
conf.count = 10;

//
// other strat-related settings
//

module.exports = conf;
