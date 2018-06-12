'use strict';

root_require('show');

const advice = {};

////////////////////
const buy = 'buy';
const sell = 'sell';

class Advice {
    constructor(type, timestamp, price) {
        this.type = type;
        this.timestamp = timestamp;
        this.price = price;
    }

    print() {
        console.log('Advice:',
            (this.type === buy ? green : red)(this.type), '@', as_price(this.price, '-')
        );
        console.log();
    }
}

////////////////////
class BuyAdvice extends Advice {
    constructor(timestamp, price) {
        super(buy, timestamp, price);
    }
}

////////////////////
class SellAdvice extends Advice {
    constructor(timestamp, price) {
        super(sell, timestamp, price);
    }
}

////////////////////
advice.buy = (timestamp, price) => new BuyAdvice(timestamp, price);
advice.is_buy = advice => advice instanceof Advice && advice.type === buy;

advice.sell = (timestamp, price) => new SellAdvice(timestamp, price);
advice.is_sell = advice => advice instanceof Advice && advice.type === sell;

////////////////////
module.exports = advice;
