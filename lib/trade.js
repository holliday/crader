'use strict';

const _ = require('underscore');
root_require('lib/show');

const trade = {};

////////////////////
const buy = 'buy';
const sell = 'sell';

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
        var type = this.type;
        var gain = ''

        if(this.type === sell) {
            type = bg_red(type);

            if(!_.isUndefined(prev_price)) {
                gain = as_num(100 * (this.price / prev_price - 1), '+-').trim() + '%';

                if(this.price > prev_price) gain = green(gain);
                else if(this.price < prev_price) gain = red(gain);
            }

        } else type = bg_green(type) + ' ';

        console.log(as_date(this.timestamp), type,
            this.symbol.as_asset(), as_vol(this.amount, '-'),
            '@',
            this.symbol.as_money(), as_price(this.price, '-'),
            'total:',
            this.symbol.as_money(), as_price(this.amount * this.price, '-'),
            'gain:', gain
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
