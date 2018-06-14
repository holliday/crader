'use strict';

root_require('core');
root_require('lib/show');

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
            type = red(this.type);

            if(is_def(prev_price)) {
                gain = this.amount * (this.price - prev_price);
                gain_pct = 100 * (this.price / prev_price - 1);
                style = not_in(gain, -0.01, 0.01, { equal: gray });
            }
        } else type = green(this.type);

        console.log(
            gray(as_date(this.timestamp)),
            type,
            this.symbol.as_asset(), as_vol(this.amount, '-'),
            '@',
            this.symbol.as_money(), as_price(this.price, '-'),
            'total:',
            this.symbol.as_money(), as_price(this.amount * this.price, '-'),
            is_def(gain)
                ? style(as_num(gain, '+').trim()) + ' '
                + style(as_num(gain_pct.toPrecision(2), '+').trim()+'%')
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
