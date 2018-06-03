'use strict';

var advice = {};

const buy_id = {};
const sell_id = {};

class Advice {
    constructor(timestamp, price) {
        this.timestamp = timestamp;
        this.price = price;
    }
    type() { return undefined; }
}

class BuyAdvice extends Advice {
    constructor(timestamp, price) { super(timestamp, price) }
    type() { return buy_id; }
}

class SellAdvice extends Advice {
    constructor(timestamp, price) { super(timestamp, price) }
    type() { return sell_id; }
}

advice.none = () => new Advice();

advice.buy = (timestamp, price) => new BuyAdvice(timestamp, price);
advice.is_buy = advice => advice instanceof Advice && advice.type() === buy_id;

advice.sell = (timestamp, price) => new SellAdvice(timestamp, price);
advice.is_sell = advice => advice instanceof Advice && advice.type() === sell_id;

module.exports = advice;
