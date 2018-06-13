'use strict';

root_require('show');

const advice = {};

////////////////////
const buy = 'buy';
const sell = 'sell';

class Advice {
    constructor(type, timestamp, symbol, price) {
        this.type = type;
        this.timestamp = timestamp;
        this.symbol = symbol;
        this.price = price;
    }

    print() {
        var style = this.type === buy ? green : red;
        console.log('Advice:',
            style(this.type), '@', this.symbol.as_money(), as_price(this.price, '-')
        );
        console.log();
    }
}

////////////////////
class BuyAdvice extends Advice {
    constructor(timestamp, symbol, price) {
        super(buy, timestamp, symbol, price);
    }
}

////////////////////
class SellAdvice extends Advice {
    constructor(timestamp, symbol, price) {
        super(sell, timestamp, symbol, price);
    }
}

////////////////////
advice.buy = (timestamp, symbol, price) => new BuyAdvice(timestamp, symbol, price);
advice.is_buy = advice => advice instanceof Advice && advice.type === buy;

advice.sell = (timestamp, symbol, price) => new SellAdvice(timestamp, symbol, price);
advice.is_sell = advice => advice instanceof Advice && advice.type === sell;

////////////////////
module.exports = advice;
