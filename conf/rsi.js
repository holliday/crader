var conf = {};

// strat name
conf.strat = 'rsi';

// strat data
conf.frame = '15m';
conf.count = 18; // rsi_period + 4

// rsi settings
conf.rsi_period = 14;

conf.oversold = 20;
conf.overbought = 80;

module.exports = conf;
