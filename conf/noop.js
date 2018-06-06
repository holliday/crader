var conf = {};

// strat name
conf.strat = 'noop';

// strat data
//
// For candlestick strats, 'count' should be set to number
// of candles and 'frame' should be set to candle size.
//
// Otherwise, 'count' should be set to 1 and 'frame' should
// be set to needed length of time for past trades.
//
conf.frame = '1m';
conf.count = 1;

//
// other strat-related settings
//

module.exports = conf;
