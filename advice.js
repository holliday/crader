'use strict';

const advice = {};

////////////////////
const buy = 'buy';
const sell = 'sell';

class Advice {
    constructor(timestamp, price, type) {
        this.timestamp = timestamp;
        this.price = price;
        this.type = type;
    }
}

////////////////////
class BuyAdvice extends Advice {
    constructor(timestamp, price) {
        super(timestamp, price, buy);
    }
}

////////////////////
class SellAdvice extends Advice {
    constructor(timestamp, price) {
        super(timestamp, price, sell);
    }
}

////////////////////
advice.buy = (timestamp, price) => new BuyAdvice(timestamp, price);
advice.is_buy = advice => advice instanceof Advice && advice.type === buy;

advice.sell = (timestamp, price) => new SellAdvice(timestamp, price);
advice.is_sell = advice => advice instanceof Advice && advice.type === sell;

////////////////////
module.exports = advice;
