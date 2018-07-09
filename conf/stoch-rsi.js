var conf = {};

// strat name
conf.strat = 'stoch-rsi';

// strat data
conf.frame = '15m';
conf.count = 35; // rsi_period + stoch_period + stoch_k + 4

// RSI settings
conf.rsi_period = 14;

// stoch settings
conf.stoch_period = 14;
conf.stoch_k = 3; // sma period
conf.stoch_d = 3; // sma period

conf.min_up = 1;
conf.min_down = 1;

module.exports = conf;
