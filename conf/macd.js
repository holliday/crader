var conf = {};

// strat name
conf.strat = 'macd';

// strat data
conf.frame = '15m';
conf.count = 38;

// macd settings
conf.short_period = 12;
conf.long_period = 26;
conf.signal_period = 9;

conf.min_up = 0.05;
conf.min_down = 0.03;

module.exports = conf;
