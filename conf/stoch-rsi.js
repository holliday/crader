var conf = {};

// strat name
conf.strat = 'stoch-rsi';

// strat data
conf.frame = '15m';
conf.count = 38; // rsi_period + stoch_period + stoch_k + stoch_d + 4

// rsi settings
conf.rsi_period = 14;

conf.oversold = 20;
conf.overbought = 80;

// stoch settings
conf.stoch_period = 14;
conf.stoch_k = 3; // sma period
conf.stoch_d = 3; // sma period

conf.min_up = 0.01;
conf.min_down = 0.001;

module.exports = conf;
