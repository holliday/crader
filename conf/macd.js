var conf = {};

// strat name
conf.strat = 'macd';

// strat data
conf.frame = '15m';
conf.count = 30; // long_period + 4

// MACD settings
conf.short_period = 12;
conf.long_period = 26;
conf.signal_period = 9;

conf.min_up = 0.01;
conf.min_down = 0.01;

module.exports = conf;
