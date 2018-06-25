var conf = {};

conf.trader = 'paper';

// maximum portion of assets to buy/sell
// NB: do not set to more than 0.99
conf.max_buy = 0.99;
conf.max_sell = 0.99;

// paper trader settings

// starting balance
conf.start_asset = 0;
conf.start_money = 1000;

// trading fee
conf.fee = 0.001;

// slippage
conf.slippage = 0.0001;

module.exports = conf;
