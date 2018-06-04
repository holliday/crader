'use strict';

const advice = {};

const buy_type = {};
const sell_type = {};

class Advice {
    constructor(timestamp, price) {
        this.timestamp = timestamp;
        this.price = price;
    }
    type() { return undefined; }
}

class BuyAdvice extends Advice {
    constructor(timestamp, price) { super(timestamp, price) }
    type() { return buy_type; }
}

class SellAdvice extends Advice {
    constructor(timestamp, price) { super(timestamp, price) }
    type() { return sell_type; }
}

advice.none = () => new Advice();

advice.buy = (timestamp, price) => new BuyAdvice(timestamp, price);
advice.is_buy = advice => advice instanceof Advice && advice.type() === buy_type;

advice.sell = (timestamp, price) => new SellAdvice(timestamp, price);
advice.is_sell = advice => advice instanceof Advice && advice.type() === sell_type;

module.exports = advice;
