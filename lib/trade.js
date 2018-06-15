'use strict';

const as = lib_require('as');
const is = lib_require('is');

const trade = {};

////////////////////
const buy  = 'bought';
const sell = ' sold ';

class Trade {
    constructor(type, timestamp, symbol, amount, price) {
        this.type = type;
        this.timestamp = timestamp;
        this.symbol = symbol;
        this.amount = amount;
        this.price = price;
    }

    ////////////////////
    print(prev_price) {
        var gain, gain_pct, style;

        var type;
        if(this.type === sell) {
            type = as.red(this.type);

            if(is.def(prev_price)) {
                gain = this.amount * (this.price - prev_price);
                gain_pct = 100 * (this.price / prev_price - 1);
                style = as.not_in(gain, -0.01, 0.01, { equal: as.gray });
            }
        } else type = as.green(this.type);

        console.log(
            as.gray(as.date(this.timestamp)),
            type,
            this.symbol.as_asset(), as.vol(this.amount, '-'),
            '@',
            this.symbol.as_money(), as.price(this.price, '-'),
            'total:',
            this.symbol.as_money(), as.price(this.amount * this.price, '-'),
            is.def(gain)
                ? style(as.num(gain, '+').trim()) + ' '
                + style(as.num(gain_pct.toPrecision(2), '+').trim()+'%')
                : ''
        );
    }
}

////////////////////
class BuyTrade extends Trade {
    constructor(timestamp, symbol, amount, price) {
        super(buy, timestamp, symbol, amount, price);
    }
}

////////////////////
class SellTrade extends Trade {
    constructor(timestamp, symbol, amount, price) {
        super(sell, timestamp, symbol, amount, price);
    }
}

////////////////////
trade.buy = (timestamp, symbol, amount, price) => new BuyTrade(timestamp, symbol, amount, price);
trade.is_buy = trade => trade instanceof Trade && trade.type === buy;

trade.sell = (timestamp, symbol, amount, price) => new SellTrade(timestamp, symbol, amount, price);
trade.is_sell = trade => trade instanceof Trade && trade.type === sell;

////////////////////
module.exports = trade;
